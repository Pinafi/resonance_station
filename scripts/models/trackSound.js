class TrackSound extends Component{

    constructor(audio, track, request){
        super(request, "templates/components/track-sound.html");
        this.audio = audio;
        this.track = track;
        this.dialog = null;
    }
    
    afterInit = () => {}

    init = () => {
        this.element.onmousedown = this.initDragFunction;
        this.setWaveFormBackground();
        this.afterInit();
    }

    setWaveFormBackground = () => {
        let type = this.audio.src.split(':')[1].split(';')[0];
        let audioContext = new AudioContext();
        let reader = new FileReader();
        reader.onload = () => {
            audioContext.decodeAudioData( reader.result, (buffer) => { 
                let canvas = document.createElement("canvas");
                this.drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffer ); 
                let waveFormImage = canvas.toDataURL(type);
                this.element.style.setProperty('--bg-waveform', `url(${waveFormImage})`);
            });
        };
        reader.readAsArrayBuffer(this.audio.file);
    }

    drawBuffer = ( width, height, context, buffer ) => {
        var data = buffer.getChannelData( 0 );
        var step = Math.ceil( data.length / width );
        var amp = height / 2;
        for(var i=0; i < width; i++){
            var min = 1.0;
            var max = -1.0;
            for (var j=0; j<step; j++) {
                var datum = data[(i*step)+j]; 
                if (datum < min)
                    min = datum;
                if (datum > max)
                    max = datum;
            }
            context.fillStyle = "#FFFFFF";
            context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
        }
    }

    initDragFunction = (event) => {
        let absoluteXClickPosition = ((event.pageX - tracksPanel.timeline.offsetLeft) + tracksPanel.timeline.scrollLeft);
        let clickedPositionOnElement = (absoluteXClickPosition - ((60 * ((this.audio["startTs"] * 100)/1000) )/ 100));
        let dragged = false;
        //init drag handle
        let mouseObservedAction = global.mouse.subscribe((e) => {
            if(e.type == "mousemove"){
                dragged = true;
                if(e.target != this.element.parentElement && e.target.classList.contains("line")){
                    e.target.append(this.element);
                    let removedSounds = this.track.line.sounds.splice(this,1);
                    let receptorTrack =  tracksPanel.tracks.find(track => track.line.element == e.target);
                    receptorTrack.line.sounds.push(removedSounds[0]);
                    this.track = receptorTrack;
                    receptorTrack.line.sortSounds();
                }else{
                    let left = (60 * ((this.audio["startTs"] * 100)/1000) )/ 100;
                    left = ((e.pageX - tracksPanel.timeline.offsetLeft) + tracksPanel.timeline.scrollLeft) - clickedPositionOnElement;
                    left = (left < 0)? 0 : left;
                    this.element.style.left = `${left}px`;
                    this.audio["startTs"] = ((1000* ((left * 100)/60))/100);
                }
            }
        });
        //stop drag handle
        let mouseUpSubscriptedAction = null;
        mouseUpSubscriptedAction = global.mouse.subscribe((e) => {
            if(e.type == "mouseup"){
                global.mouse.unsubscribe(mouseObservedAction);
                global.mouse.unsubscribe(mouseUpSubscriptedAction);
                this.stop();

                if(e.x == event.x && !dragged){
                    this.click();
                }else{
                    this.track.line.sortSounds();
                    tracksPanel.calculateCompositionDuration();
                }
            }
        });
    }

    click = () => {
        if(this.dialog != null){
            this.dialog.open();
        }else{
            this.dialog = new TrackSoundDialog(this.request);
            this.dialog.afterInit = () => {
                this.dialog.open();
            }
        }
    }

    play = () => {
        this.audio.play();
    }
    pause = () => {
        this.audio.pause();
    }
    stop = () => {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
}