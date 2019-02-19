"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


var isfitMsg = exports;

 
isfitMsg.attach = function(params){
    if(params.server){
        let io = require('socket.io')(params.server);
        params.io = io;
        isfitMsg.io = io;
        params.emitter.emit("msgReady",io);
       
       
    }
}