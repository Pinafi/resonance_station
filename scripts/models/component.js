class Component{

    element = null;
    
    constructor(request, template_url){
        this.request = request;
        this.template_url = template_url;
        this.getTemplate().then(() => this.init());
    }

    getTemplate = () => {
        return this.request.get(this.template_url)
        .then(result => { 
            let template = document.createElement("div");
            template.innerHTML = result.response;
            template = template.firstChild;
            this.element = template;
        }).catch(error => console.log(error));
    }

    init = () => {}
}