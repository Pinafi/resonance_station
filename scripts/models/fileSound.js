class FileSound extends Component{
    constructor(audio, request){
        super(request, "templates/components/file-sound.html");
        this.audio = audio;
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

    init = () => {
        this.element.querySelector(".mdi-play").onclick = () => this.play();
        this.element.querySelector(".mdi-pause").onclick = () => this.pause();
        this.element.querySelector(".mdi-stop").onclick = () => this.stop();
        this.afterInit();
    }

    afterInit = () => {};
}