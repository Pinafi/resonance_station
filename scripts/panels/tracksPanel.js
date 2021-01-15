class TracksPanel extends Panel{
    
    tracks = [];
    counter = null;
    playedSounds = [];
    timeline = null;
    timelineHeader = null;
    timelineControls = null;
    trackPointer = null;
    trackPointerMoment = 0;
    endCompositionTs = 0;

    constructor(request){
        super(request, "tracks-panel", "templates/panels/tracks-panel.html");
    }

    afterInit = () => {
        this.timeline = document.querySelector("#timeline");
        this.timelineControls = document.querySelector("#controls");
        
        this.setTimeLabels();
        this.initTrackPointer();
        this.setControls();
        this.addTrack();
        this.calculateDisplayCounter();
        
        this.timeline.onscroll = () => {
            if(this.timelineHeader.clientWidth < this.timeline.scrollWidth){
                this.timelineHeader.style.width = this.timeline.scrollWidth+"px";
                this.timelineControls.style.width = this.timeline.scrollWidth+"px";
                this.setTimeLabels();
            }
        }
        this.element.querySelector("#controls_header .mdi-plus").onclick = () => {
            this.addTrack();        
        };
    }

    initTrackPointer = () => {
        let mouseObservedAction = null;
        let continuePlaying = null;
        
        this.trackPointer = this.element.querySelector("#track_pointer");

        let dragComponent = (event) => {
            continuePlaying = this.counter != null;
            
            this.stop();
            let left = (event.pageX - this.timeline.offsetLeft) + this.timeline.scrollLeft;
            left = (left < 0)? 0 : left;
            let trackPointerMoment = (((left*100)/60) * 1000)/100;
            this.setTrackPointerMoment(trackPointerMoment);

            let action = (e) => {
                if(e.type == "mousemove"){
                    let left = (e.pageX - this.timeline.offsetLeft) + this.timeline.scrollLeft;
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
        this.timelineHeader.onmousedown = (event) => {
            dragComponent(event);
            stopDragComponent();
        };
        this.trackPointer.onmousedown =  (event) => {
            dragComponent(event);
            stopDragComponent();
        };
    }

    setTimeLabels = () => {
        this.timelineHeader = this.element.querySelector("#line_header");
        this.timelineHeader.innerHTML = "";
        let timelineHeaderWidth = this.timelineHeader.clientWidth;
        for(let i = 0; i < Math.ceil(timelineHeaderWidth/60); i++){
            let label = document.createElement("span");
            let hours = (i < 10)?`0${i}`:i.toString();
            if(i > 0){
                label.textContent = `${hours}:00`;
                label.style.left = `${(i*60)-30}px`;
            }
            this.timelineHeader.append(label);
        }
    }

    setControls = () => {
        let playButton = document.querySelector(".window_title_bar .mdi-play");
        let pauseButton = document.querySelector(".window_title_bar .mdi-pause");
        let stopButton = document.querySelector(".window_title_bar .mdi-stop");

        playButton.onclick = () => {
            if(this.trackPointerMoment > this.endCompositionTs)
                this.stop();
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
        let hasSomeTrackWithSounds = this.tracks.some(track => track.line.sounds.length > 0);
        if(hasSomeTrackWithSounds){
            let lastUpdate = Date.now();
            let startTime = lastUpdate;
            if(this.trackPointerMoment > 0 ){
                startTime = lastUpdate - this.trackPointerMoment;
                this.tracks.forEach(track => {
                    for(let sound of track.line.sounds){
                        if(sound.audio.startTs < this.trackPointerMoment && sound.audio.startTs + (sound.audio.duration*1000) > this.trackPointerMoment){
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
                            sound.audio.startTs < this.trackPointerMoment && 
                            (sound.audio.startTs + (sound.audio.duration*1000)) > this.trackPointerMoment
                        ){
                            sound.play();
                            this.playedSounds.push(sound);
                        }
                    });
                });
                if(this.trackPointerMoment > this.endCompositionTs)
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
        this.calculateDisplayCounter();
    }

    milisecondsToPixels = ( miliseconds => (((((miliseconds)*100)/1000)*60)/100)+"px" )

    clearCounter = () => {
        clearInterval(this.counter);
        this.counter = null;
    }

    calculateDisplayCounter=() => {
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
            this.timelineControls.append(track.control.element);
        }
        track.line.afterInit = () => {
            this.timeline.querySelector(".content").append(track.line.element);
        }
        track.onAddSound = (audio) => {
            this.setTimeLabels();
            this.clearCounter();
            this.playedSounds.forEach(s => s.stop());
            this.playedSounds = [];

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
        this.endCompositionTs = 0;
        
        for(let track of this.tracks){
            if(track.line.sounds.length > 0){
                let sound = track.line.sounds[track.line.sounds.length - 1];
                if(this.endCompositionTs < sound.audio.startTs + (sound.audio.duration*1000))
                    this.endCompositionTs = sound.audio.startTs + (sound.audio.duration*1000);
            }
        }
    }
}