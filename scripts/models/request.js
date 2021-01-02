class Request{
    
    constructor(){}

    get = (url, params = null) => {

        if(params != null && typeof params === "object")
            url += this.jsonToParamap(params);

        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr);
                } else {
                    reject(xhr);
                }
            };
            xhr.onerror = () => {
                reject(xhr);
            };
            this.setHeaders(xhr, {'Content-Type': 'application/json',"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"});
            xhr.send();
        });
    }

    setHeaders = (xhr, headers) => {
        for(let key in headers){
            xhr.setRequestHeader(key, headers[key]) 
        }
    }

    jsonToParamap = ( params => `? ${Object.keys(params).map( key => key+"="+encodeURIComponent(params[key]) ).join("&")}` );
}