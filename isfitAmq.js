"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let Stomp = require('stomp-client');
let events = require("events");


//defualtAMQ = function(config){
  //module.amqClient = new AMQQueenClient(config.ip,config.port,config.user,config.pass);
//}



function begin(emitter){
  console.log("init----------------------------");
  var fs = require('fs');
  let config = {ip:'127.0.0.1',port:61613,user:'admin',pass:'admin'};
  if(fs.existsSync('amq.config')){
    fs.readFile('amq.config','utf-8', (err, data) => {
      
      if(data){
        let configFile = JSON.parse(data);
      if(configFile){
        config.ip = !configFile.ip ? config.ip : configFile.ip;
        config.port = !configFile.port ? config.port : configFile.port;
        config.pass = !configFile.pass ? config.user : configFile.pass;
      }
      amq.config = config;
      //defualtAMQ(config);
      amq.client = new AMQQueenClient(config.ip,config.port,config.user,config.pass,emitter);

      }
      
    });

  }
  else{
    //defaultAMQ(config);
    amq.client = new AMQQueenClient(config.ip,config.port,config.user,config.pass,emitter);
    fs.writeFile('amq.config',JSON.stringify(config));

  }
  

}

//module.amqClient = null;

class AMQQueenClient{
  //client;
  //destination;
  //succ;
  
  constructor(ip,port,user,pass,emitter){
    
    //this.emitter = new events.EventEmitter();
    console.log("set emitter" + emitter);
    this.client = new Stomp(ip, port, user, pass);
    var self = this;
    self.emitter = emitter;
    this.client.connect(function(sessionId) {
      //self.succ = true;
      //module.amqClient = self;
      console.log("amq *********connect finished************" + ip + ":" + port);
      console.log("emmitter *********************" + typeof self.emitter);
      self.emitter.emit("amq_connected",self,sessionId);
      
  },function(err){
    console.log("error *********************" + err);
  });

  }

  sendMsg(destination,msg){
    if(this.client){
      this.client.publish(destination,msg);
    }
  }

  subscribe(destination,fun){
    console.log("------------subcribe-------" + destination);
    this.client.subscribe(destination,fun);
  }

 

}

var amq = exports;
amq.init = begin;
amq.client = null;
amq.config = null;

//module.exports = AMQQueenClient;
