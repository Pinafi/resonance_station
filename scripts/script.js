window.AudioContext = window.AudioContext || window.webkitAudioContext;

var request = new Request();

var global = {
    mouse:{
        event:null, 
        actions:[],
        subscribe: (action) => {
            let result = action;
            if(action != null && typeof action == "function" && !global.mouse.actions.includes(action)){
                global.mouse.actions.push(action);
            }else{
                result = null;
            }
            return result;
        },
        unsubscribe: (action) => {
            if(action != null && typeof action == "function" && global.mouse.actions.includes(action)){
                global.mouse.actions.splice(global.mouse.actions.indexOf(action), 1);
            }
        }
    },
}

window.onmousemove = (event) => {
    global.mouse.event = event;
    for(let action of global.mouse.actions){
        action(event);
    }
}
window.onmouseup = (event) => {
    global.mouse.event = event;
    for(let action of global.mouse.actions){
        action(event);
    }
}
window.onmousedown = (event) => {
    global.mouse.event = event;
    for(let action of global.mouse.actions){
        action(event);
    }
}


var filesPanel = new FilesPanel(request);
var tracksPanel = new TracksPanel(request);