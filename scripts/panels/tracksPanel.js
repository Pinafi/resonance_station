class TracksPanel extends Panel{
    
    tracks = [];
    playedSounds = [];
    tracksLines = null;
    tracksControls = null;
    trackPointer = null;
    trackPointerMoment = 0;
    counter = null;
    endTs = 0;

    constructor(request){
        super(request, "tracks-panel", "templates/panels/tracks-panel.html");
    }

    afterInit = () => {
        this.tracksLines = document.querySelector("#timeline");
        this.tracksControls = document.querySelector("#controls");
        this.trackPointer = this.element.querySelector("#track_pointer");
        
        this.setTimeLabels();
        this.setControls();
        this.addTrack();
        this.calculateCounter();
        
        window.onresize = () => {
            this.setTimeLabels();
        }
        this.element.querySelector("#controls_header .mdi-plus").onclick = () => {
            this.addTrack();        
        };
    }

    setTimeLabels = () => {
        let line_header = this.element.querySelector("#line_header");
        line_header.innerHTML = "";
        let line_header_width = line_header.clientWidth;
        for(let i = 0; i < Math.ceil(line_header_width/60); i++){
            let label = document.createElement("span");
            let hours = (i < 10)?`0${i}`:i.toString();
            if(i > 0){
                label.textContent = `${hours}:00`;
                label.style.left = `${(i*60)-30}px`;
            }
            line_header.append(label);
        }

        let mouseObservedAction = null;
        let continuePlaying = null;

        let dragComponent = () => {
            continuePlaying = this.counter != null;
            
            this.stop();
            let left = (event.pageX - this.tracksLines.offsetLeft) + this.tracksLines.scrollLeft;
            left = (left < 0)? 0 : left;
            let trackPointerMoment = (((left*100)/60) * 1000)/100;
            this.setTrackPointerMoment(trackPointerMoment);

            let action = (e) => {
                if(e.type == "mousemove"){
                    let left = (e.pageX - this.tracksLines.offsetLeft) + this.tracksLines.scrollLeft;
                    left = (left < 0)? 0 : left;
                    let trackPointerMoment = (((left*100)/60) * 1000)/100;
                    this.setTrackPointerMoment(trackPointerMoment);
                }
            };
            mouseObservedAction = global.mouse.subscribe(action);
        };
        let stopDragComponent = () =>{
            let mouseUpSubscriptedAction = null;
            mouseUpSubscriptedAction = global.mouse.subscribe((e) => {
                if(e.type == "mouseup"){
                    global.mouse.unsubscribe(mouseObservedAction);
                    global.mouse.unsubscribe(mouseUpSubscriptedAction);
                    if(continuePlaying) this.play();
                    continuePlaying = null;
                }
            });
        }
        line_header.onmousedown = (event) => {
            dragComponent();
            stopDragComponent();
        };
        this.trackPointer.onmousedown =  (event) => {
            dragComponent();
            stopDragComponent();
        };
        
    }

    setControls = () => {
        let playButton = document.querySelector(".window_title_bar .mdi-play");
        let pauseButton = document.querySelector(".window_title_bar .mdi-pause");
        let stopButton = document.querySelector(".window_title_bar .mdi-stop");

        playButton.onclick = () => {
            this.play();
        };
        pauseButton.onclick = () => {
            this.pause();
        };
        stopButton.onclick = () => {
            this.stop();
        };
    }

    play = () => {
        if(this.tracks.some(track => track.line.sounds.length > 0)){
            let lastUpdate = Date.now();
            let startTime = lastUpdate;
            
            if(this.trackPointerMoment > 0 ){
                startTime = lastUpdate - this.trackPointerMoment;
                this.tracks.forEach(track => {
                    for(let sound of track.line.sounds){
                        if((sound.audio.startTs*1000) < this.trackPointerMoment && (sound.audio.startTs*1000) + (sound.audio.duration*1000) > this.trackPointerMoment){
                            sound.pause()
                            sound.audio.currentTime = (this.trackPointerMoment - sound.audio.startTs)/1000;
                            sound.audio.play();
                            this.playedSounds.push(sound);
                        }
                    }
                });
            }

            this.counter = setInterval(() => {
                let now = Date.now();
                lastUpdate = now;
                this.setTrackPointerMoment(now-startTime);
                this.tracks.forEach(track => {
                    track.line.sounds.forEach(sound => {
                        if(
                            sound.audio.startTs*1000 < this.trackPointerMoment && 
                            ((sound.audio.startTs*1000) + (sound.audio.duration*1000)) > this.trackPointerMoment
                        ){
                            sound.play();
                            this.playedSounds.push(sound);
                        }
                    });
                });
                if(this.trackPointerMoment > this.endTs)
                    this.stop();
            }, 10);
        }
    }

    pause = () => {
        for(let sound of this.playedSounds){
            if(sound.audio.startTs + (sound.audio.duration*1000) > this.trackPointerMoment)
                sound.pause();
        }
        this.clearCounter();
    }

    stop = () => {
        this.clearCounter();
        this.setTrackPointerMoment(0);
        this.playedSounds.forEach(sound => sound.stop());
        this.playedSounds = [];
        this.trackPointer.style.left = "0px";
    }

    setTrackPointerMoment = (value) => {
        this.trackPointerMoment = value;
        this.trackPointer.style.left = this.milisecondsToPixels(this.trackPointerMoment);
        this.calculateCounter();
    }

    milisecondsToPixels = ( miliseconds => (((((miliseconds)*100)/1000)*60)/100)+"px" )

    clearCounter = () => {
        clearInterval(this.counter);
        this.counter = null;
    }

    calculateCounter=() => {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        let miliseconds = this.trackPointerMoment;

        if(miliseconds >= 1000){
            seconds = Math.floor(this.trackPointerMoment/1000);
            miliseconds = this.trackPointerMoment - (Math.floor(this.trackPointerMoment/1000)*1000);
        }
        if(seconds > 60){
            minutes = Math.floor(seconds/60);
            seconds = seconds - (Math.floor(seconds/60)*60);
        }
        if(minutes > 60){
            hours = Math.floor(minutes/60);
            minutes = minutes - (Math.floor(minutes/60)*60);
        }

        hours = (hours < 10)? "0"+hours:hours;
        minutes = (minutes < 10)? "0"+minutes:minutes;
        seconds = (seconds < 10)? "0"+seconds:seconds;
        miliseconds = miliseconds.toFixed(0);
        if(miliseconds < 10){
            miliseconds = "00"+miliseconds;
        }else if(miliseconds < 100){
            miliseconds = "0"+miliseconds;
        }

        this.element.querySelector("#counter").textContent = `${hours} : ${minutes} : ${seconds} : ${miliseconds}`;
    }

    addTrack = (name = null) => {
        let id = 1;
        let track = null;

        if(this.tracks.length)
            id = this.tracks[this.tracks.length-1].id + 1;
        if(name == null)
            name = `Track ${id}`;
        
        track = new Track(id, name, this.request);
        track.control.afterInit = () => {
            this.tracksControls.append(track.control.element);
        }
        track.line.afterInit = () => {
            this.tracksLines.querySelector(".content").append(track.line.element);
        }
        track.onAddSound = (audio) => {
            this.setTimeLabels();
            this.stop();
            this.calculateCompositionDuration();
            if(!filesPanel.sounds.some((sound) => sound.audio.name == audio.name)){
                let fileSound = new FileSound(audio, this.request);
                fileSound.afterInit = () => {
                    fileSound.element.querySelector(".sound_name").textContent = audio.name;
                    filesPanel.addSound(fileSound);
                }
            }
        }
        track.onRemoveTrack = () => {
            if(this.tracks.length == 0){
                this.stop();
            }
            this.calculateCompositionDuration();
        }
        this.tracks.push(track);
    }

    calculateCompositionDuration = () => {
        this.endTs = 0;
        for(let track of this.tracks){
            if(track.line.sounds.length > 0){
                let sound = track.line.sounds[track.line.sounds.length - 1];
                if(this.endTs < sound.audio.startTs + (sound.audio.duration*1000))
                    this.endTs = sound.audio.startTs + (sound.audio.duration*1000);
            }
        }
    }
}