class TrackSound extends Component{
    constructor(audio, request){
        super(request, "templates/components/track-sound.html");
        this.audio = audio;
    }

    init = () => {
        this.afterInit();
    }

    afterInit = () => {}

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