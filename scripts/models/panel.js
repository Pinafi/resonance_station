class Panel extends Component{
    element = null;

    constructor(request, tagName, template_url=null){
        super(request, template_url);
        this.tagName = tagName;
    }

    init = () => {
        this.placeToDOM();
        this.afterInit();
    }

    afterInit = () => {}

    placeToDOM = () => {
        let element = document.getElementsByTagName(this.tagName)[0];
        element.parentElement.replaceChild(this.element,element);
    }
}