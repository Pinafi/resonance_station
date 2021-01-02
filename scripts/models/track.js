class TrackControl extends Component{
    constructor(track, name, request){
        super(request, "templates/components/track-control.html");
        this.name = name;
        this.track = track;
        this.onAddSound = null;
        this.onRemoveTrack = null;
    }

    init = () => {
        this.element.querySelector(".track_name").textContent = this.name;
        this.element.querySelector(".mdi-trash-can-outline").onclick = () => {
            let lineParent = this.track.line.element.parentElement;
            let controlParent = this.element.parentElement;
            lineParent.removeChild(this.track.line.element);
            controlParent.removeChild(this.element);
            tracksPanel.tracks.splice(tracksPanel.tracks.indexOf(this.track),1);
            if(this.track.onRemoveTrack != null && typeof this.track.onRemoveTrack === "function")
                this.track.onRemoveTrack();
        }
        this.element.querySelector(".mdi-plus").onclick = () => {
            let input = document.createElement('input');
            input.type = 'file';

            input.onchange = (e) => { 
                let file = e.target.files[0];

                let reader = new FileReader();
                reader.onload = (e)=>{
                    let audio = document.createElement('audio');
                    audio.setAttribute("preload","auto");
                    audio.src = e.target.result;
                    audio.name = file.name;

                    audio.addEventListener('loadedmetadata', () => {

                        let sound = new TrackSound(audio, this.track, this.request);
                        sound.afterInit = () => {
                            sound.element.textContent = file.name;
                            sound.element.style.width = `${audio.duration*60}px`;
                            
                            let left = ( ((tracksPanel.trackPointerMoment * 100)/1000) *60)/100;
                            sound.element.style.left = `${left}px`;
                            sound.audio["startTs"] = tracksPanel.trackPointerMoment;
                            
                            this.track.line.element.append(sound.element);
                            this.track.line.sounds.push(sound);
                            this.track.line.sounds.sort((soundA, soundB) => soundA.audio["startTs"] - soundB.audio["startTs"]);

                            if(this.track.onAddSound != null && typeof this.track.onAddSound === "function")
                                this.track.onAddSound(sound);
                        }
                    },false);
                };
                reader.readAsDataURL(file);
            }

            input.click();
        }
        this.afterInit();
    }

    afterInit = () => {}
}

class TrackLine extends Component{
    constructor(track, name, request){
        super(request, "templates/components/track-line.html");
        this.name = name;
        this.sounds = [];
        this.track = track;
    }

    init = () => {
        this.afterInit();
    }

    afterInit = () => {}
}

class Track{
    constructor(id, name, request){
        this.id = id;
        this.name = name;
        this.request = request;
        this.onAddSound = null;
        this.control = new TrackControl(this, this.name, this.request);
        this.line = new TrackLine(this, this.name, this.request);
    }
}