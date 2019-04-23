let timer_nb = 1;
let root = document.getElementById("rootdiv");
let sound1 = document.getElementById('sound1');

function addcolons(event) {
    var key = event.keyCode || event.charCode;
    var initlen = this.value.length
    var pos = this.selectionStart;

    var s = this.value
    s = s.replace(/:/g, '');
    s = s.replace(/[^0-9:]+/g, '');
    if (s.length > 4) {
        s = s.substring(0, 2)
            + ':' + s.substring(2, 4)
            + ':' + s.substring(4, 6)
    } else if (s.length > 2) {
        s = s.substring(0, 2)
            + ':' + s.substring(2)
    }
    this.value = s
    var newpos = pos + this.value.length - initlen
    this.setSelectionRange(newpos, newpos)

    if (key == 13) {
        var timer = this.parentNode.parentNode
        console.log(timer)
        timer.querySelector('.btnstart').click();
    }

}

function PlaySound(soundObj) {
    var sound = document.getElementById(soundObj);
    sound.Play();
}
function duplicate(timer) {
    let clone = timer.cloneNode(true); // "deep" clone
    clone.id = "timer" + ++timer_nb; // there can only be one element with an ID
    addEventListeners(clone);
    clone.querySelector('.time-input').value = timer.querySelector('.time-input').value
    root.appendChild(clone);
    return clone;
}
function parseTime(str) {
    if (str.length < 3) {
        var hour = 0;
        var min = parseInt(str.replace(':', '') || 0);
        var sec = 0;
    } else if (str.length < 5) {
        var hour = parseInt(str.split(':')[0]) || 0;
        var min = parseInt(str.split(':')[1]) || 0;
        var sec = 0;
    } else {
        var hour = parseInt(str.split(':')[0]) || 0;
        var min = parseInt(str.split(':')[1]) || 0;
        var sec = parseInt(str.split(':')[2]) || 0;
    }
    return [hour, min, sec]
}
function formatTime(hours, minutes, seconds, nohours) {
    return (hours == 0 && nohours ? '' : ("0" + hours).slice(-2) + ':')
        + ("0" + minutes).slice(-2)
        + ':' + ("0" + seconds).slice(-2)
}

function start(timer) {
    var startbtn = timer.querySelector('.btnstart');
    var input = timer.querySelector('.time-input')
    var progress = timer.querySelector('.bar')
    var chrono = timer.querySelector('.chrono').checked
    if (startbtn.classList.contains('green')) {
        var [hour, min, sec] = parseTime(input.value)
        if (!chrono) {
            timer.initValue = formatTime(hour, min, sec, false);
        } else (
            timer.initValue = ''
        )

        var start_time = new Date();
        var duration = hour * 60 * 60 * 1000 + min * 60 * 1000 + sec * 1000
        end_time = new Date(start_time.getTime() +  duration);
        if (hour + min + sec == 0 && !chrono) return;
        if (chrono) {
            start_time = new Date(start_time.getTime() -  duration);
        } 
        var finished = false;

        timer.timer = setInterval(function () {
            var now = new Date().getTime();

            if (chrono) {
                var distance = Math.abs(now - start_time);
            } else {
                var distance = Math.abs(end_time - now);
            }

            if (!finished && !chrono) {
                var percent = 100 - Math.floor(distance / 1000) / Math.floor(duration / 1000) * 100;
                progress.style = 'width:' + percent + '%';
            } else {
                progress.style = 'width:100%';
            }
            if (percent >= 99) {
                sound1.play();
                finished = true;
            }
            var hours = Math.floor(distance / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            input.value = (finished ? "-" : "") + formatTime(hours, minutes, seconds, false)
        }, 500); // if every sec some values are missed

        startbtn.classList.remove('green');
        startbtn.classList.add('red')
        startbtn.innerText = 'stop'
        input.readOnly = true;
        timer.classList.add('timer-active')

    } else {
        stop(timer);
        input.value = timer.initValue;
    }
}
function stop(timer) {
    var startbtn = timer.querySelector('.btnstart')
    startbtn.classList.remove('red');
    startbtn.classList.add('green')
    startbtn.innerText = 'start'
    var input = timer.querySelector('.time-input')
    input.readOnly = false;
    var progress = timer.querySelector('.bar')
    progress.style = 'width:' + 0 + 'px';
    sound1.pause()
    sound1.currentTime = 0;
    timer.classList.remove('timer-active')
    clearInterval(timer.timer)
}

function resetbtns(timer) {
    var startbtn = timer.querySelector('.btnstart')
    startbtn.classList.remove('red');
    startbtn.classList.add('green')
    startbtn.innerText = 'start'
    timer.timer = null
    var input = timer.querySelector('.time-input')
    input.readOnly = false;
    var progress = timer.querySelector('.bar')
    progress.style = 'width:0px;'
}
function remove(timer) {
    stop(timer);
    if (timer_nb > 1) {
        root.removeChild(timer);
        timer_nb--;
    } else {
        timer.querySelector('.time-input').value = '';
    }
}
function addEventListeners(timer) {
    timer.querySelector(".btnadd").onclick = () => duplicate(timer); // event handlers are not cloned
    timer.querySelector(".time-input").addEventListener('keyup', addcolons);
    timer.querySelector(".btnclose").onclick = () => remove(timer);
    timer.querySelector('.btnstart').onclick = () => start(timer);
    timer.querySelector('.btnpause').onclick = () => stop(timer);
    timer.querySelector('.progress').ondblclick = () => {
        var x = timer.querySelector('.advanced-pan')
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
    resetbtns(timer)

}
function isOn(timer) {
    return timer.querySelector('.btnstart').classList.contains('red')
}
function drag(ev) {
    var timer = ev.target.parentNode.parentNode
    var s = window.location.origin + window.location.pathname + '?'
    ev.dataTransfer.setData('text', s + timer2string(timer));
}
function dragend(ev) {
    var timer = ev.target.parentNode.parentNode
    remove(timer)
}
function timer2string(timer) {
    return (timer.querySelector('.time-input').value || ' ')
        + '/' + isOn(timer)
        + '/' + (timer.querySelector('.timer-name').value || ' ')
        + '/' + (timer.querySelector('.chrono').checked || ' ')
}
function string2timer(str) {
    var fields = str.replace(/%20/g,' ').split('/')
    var newtimer = duplicate(root.querySelector('#timer0'));
    newtimer.querySelector('.time-input').value = fields[0];
    console.log(fields[2])
    newtimer.querySelector('.timer-name').value = fields[2];

    newtimer.querySelector('.chrono').checked = fields[3];
    if (fields[1] == 'true') {
        start(newtimer)
    }
    return newtimer
}
class timer{
  constructor(time, name, chrono, node){
    this.time = time
    this.name = name
    this.chrono = chrono
  }
  toString(){
    timer.querySelector('.time-input').value
      + '/' + isOn(timer)
      + '/' + timer.querySelector('.timer-name').value
      + '/' + timer.querySelector('.chrono').checked;
  }
}
/***** MAIN *****/
addEventListeners(document.getElementById("timer0"));

if (window.location.search) {
    for (var str of window.location.search.replace('\?', '').split(',')) {
        string2timer(str)
    }
    if (timer_nb == 2) {
        remove(document.getElementById("timer0"))
    }

}

// update of the document title and url to reflect the page state
setInterval(() => {
    var min = 25 * 3600;
    document.title = 'timer';
    for (let timer of document.querySelectorAll('.timer')) {
        if (isOn(timer)) {
            var input = timer.querySelector('.time-input')
            var [h, m, s] = parseTime(input.value)
            var time = h * 3600 + m * 60 + s;
            if (time < min) {
                min = time;
                var name = timer.querySelector('.timer-name').value
                document.title = formatTime(h, m, s, true) + (name ? '--' + name :'');
            }
        }
    }
    /*url = window.location.origin + window.location.pathname
    
   console.log(
    + '?'+ Array.from(
            root.querySelectorAll('.timer')
          ).map(t=>t.toString()).join('//')
   )*/
}, 1000)
