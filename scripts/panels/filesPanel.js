class FilesPanel extends Panel{

    sounds = [];
    
    constructor(request){
        super(request, "files-panel", "templates/panels/files-panel.html");
    }

    afterInit = () => {}

    addSound = (sound) => {
        this.sounds.push(sound);
        this.element.append(sound.element);
    }
}