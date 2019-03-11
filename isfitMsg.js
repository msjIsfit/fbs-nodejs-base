"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


var isfitMsg = exports;

 
isfitMsg.attach = function(params){
    if(params.server){
        console.log("start socket io server");
        let io = require('socket.io')(params.server);
        //io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
        io.set('origins', '*:*');
        params.io = io;
        isfitMsg.io = io;
        params.emitter.emit("msgReady",io);
       
       
    }
    
}