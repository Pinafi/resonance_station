class Dialog extends Component{

    constructor(request, template){
        super(request,template);
    }

    afterInit = () => {}

    init = () => {
        this.element.onmousedown = this.initDragFunction;
        this.afterInit();
    }

    initDragFunction = (event) => {
        //init drag handle
        let xOffset = event.x-this.element.offsetLeft;
        let yOffset = event.y-this.element.offsetTop;
        let panelTitleBar = this.element.querySelector(".panel_title_bar");
        let dragging = event.path.some(p => p == panelTitleBar);

        let mouseObservedAction = global.mouse.subscribe((e) => {
            if(e.type == "mousemove"){
                if(dragging){
                    let maxLeft = window.innerWidth;
                    let maxTop = window.innerHeight;
                    
                    let left = e.x - xOffset;
                    let top = e.y - yOffset;

                    if(left < 0)
                        left = 0;
                    else if(left + this.element.offsetWidth > maxLeft)
                        left = maxLeft - this.element.offsetWidth;

                    if(top < 0)
                        top = 0;
                    else if(top + this.element.offsetHeight > maxTop)
                        top = maxTop - this.element.offsetHeight;
                    
                    this.element.style.left = `${left}px`;
                    this.element.style.top = `${top}px`;
                }  
            }
        });
        //stop drag handle
        let mouseUpSubscriptedAction = null;
        mouseUpSubscriptedAction = global.mouse.subscribe((e) => {
            if(e.type == "mouseup"){
                if(dragging) dragging = false;
                global.mouse.unsubscribe(mouseObservedAction);
                global.mouse.unsubscribe(mouseUpSubscriptedAction);
            }
        });
    }

    open = () => {
        if(this.element != null){
            let closeButtons = this.element.querySelectorAll(".button-close");
            closeButtons.forEach((element) => {
                element.onclick = () => {
                    this.close(); 
                };
            });
        }
        let body = document.querySelector("body");
        body.append(this.element);
        if(this.element.style.left == "")
            this.element.style.left = ((window.innerWidth - this.element.clientWidth)/2)+"px";
        if(this.element.style.top == "")
            this.element.style.top = ((window.innerHeight - this.element.clientHeight)/2)+"px";
    }

    close = () => {
        let body = document.querySelector("body");
        body.removeChild(this.element);
    }

}