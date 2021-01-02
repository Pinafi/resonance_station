class TrackSound extends Component{

    constructor(audio, track, request){
        super(request, "templates/components/track-sound.html");
        this.audio = audio;
        this.track = track;
    }
    
    afterInit = () => {}

    init = () => {
        this.element.onmousedown = this.initDragFunction;
        this.afterInit();
    }

    initDragFunction = (event) => {
        let absoluteXClickPosition = ((event.pageX - tracksPanel.timeline.offsetLeft) + tracksPanel.timeline.scrollLeft);
        let clickedPositionOnElement = (absoluteXClickPosition - ((60 * ((this.audio["startTs"] * 100)/1000) )/ 100));
        //init drag handle
        let mouseObservedAction = global.mouse.subscribe((e) => {
            if(e.type == "mousemove"){
                let left = (60 * ((this.audio["startTs"] * 100)/1000) )/ 100;
                left = ((e.pageX - tracksPanel.timeline.offsetLeft) + tracksPanel.timeline.scrollLeft) - clickedPositionOnElement;
                left = (left < 0)? 0 : left;
                this.element.style.left = `${left}px`;
                this.audio["startTs"] = ((1000* ((left * 100)/60))/100);
            }
        });
        //stop drag handle
        let mouseUpSubscriptedAction = null;
        mouseUpSubscriptedAction = global.mouse.subscribe((e) => {
            if(e.type == "mouseup"){
                global.mouse.unsubscribe(mouseObservedAction);
                global.mouse.unsubscribe(mouseUpSubscriptedAction);
                this.stop();
                this.track.line.sounds.sort((soundA, soundB) => soundA.audio["startTs"] - soundB.audio["startTs"]);
                tracksPanel.calculateCompositionDuration();
            }
        });
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