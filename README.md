# fbs-nodejs-base
isfit的nodejs前端业务服务器基础代码
接口为：

module.exports={

    isfit_global //可以通过该接口获取BSS的信息，消息队列，数据库的接口也在其中
    
    isfitCfg //配置接口，可以通过该接口向BSS中进行设备配置
    
    isfitPro //协议发送接口，可以通过该接口向BSS发送协议调用BSS上的restful API
    
    isfitAMQ //消息队列接口，可以通过该接口向BSS发送消息或获取BSS的消息
    
};
使用时，直接引用 

let isfit = require（‘isfit-fbs-base’）

本库将之间进行初始化

初始化的逻辑为：

根据配置文件（bss.config)的地址从BSS获取消息队列配置，链接消息队列和BSS通讯

从消息队列中获取数据库配置信息，连接数据库

开发fbs的基础步骤：

1.建立一个nodejs express工程

2.npm isfit-fbs-base -save


一般部署时fbs和bss在同一服务器中（或docker）因而fbs中bss的默认地址为http://127.0.0.1:8080

常用例子：
router.post('/reinit',function(req,res){

  if(req.body.host && req.body.username && req.body.password){
  
    let host = req.body.host;
    let username = req.body.username;
    let password = req.body.password;
    
    //let isfit = require('isfit-fbs-base').isfit_global;
    isfit.reInit(host,username,password,__dirname.replace('routes','isfit_template'),res);
    
  }

});

这个例子重新设置bss地址，isfit.reinit将指定目录的模板同步到指定bss上，同时更新自己的数据库和消息队列地址，
完成后，reinit调用exit让nodejs退出，pm2会重新启动nodejs。

使用数据库的例子：

const isfit = require('isfit-fbs-base');
var express = require('express');
var router = express.Router();
router.get('/objs',function(req,res){
    isfit.isfit_global.mysql.query('select * from obj_monitored',function(err, rows, fields){
        if(err){
            res.send(err);
        }
        if(rows){
            res.send(rows);
        }
    })
})

router.get('/trajectoryHistory',function(req,res){
    isfit.isfit_global.mongodb.collection("trajectoryHistory"). find({}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;
        res.send(result);
        //db.close();
    });
})
module.exports = router;




背景知识
FBS
FBS是前置业务服务器的意思，在IsFit中有BSS，BSS是后端业务服务器。BSS主要处理数据和协议的接入（设备管理，连接管理）。而FBS将处理与客户和流程相关的业务，这些业务包括用户认证与权限，用户告警推送，用户的其他业务逻辑。
FBS使用nodejs开发，对于和设备相关的功能与BSS通过消息队列和Restful API通讯，FBS和BSS通用一套mysql和mongoDB。FBS将可作为IsFit的一个微服无整合到整个系统中。



1.通过Nginx进行整合

vi /etc/nginx/bss.conf

upstream bss  {
    server 127.0.0.1:8080; #Apache
}

upstream fbs  {

    server 127.0.0.1:3000; #nodejse
}


server {
    listen 19999;
    server_name  fbs;




    ##access_log  logs/bss.access.log;


    ##error_log  logs/bss.error.log;
    ##root   html;
    ##index  index.html index.htm index.php;

    ## send request back to apache ##
    location / {


        proxy_pass  http://bss;
        #Proxy Settings
        proxy_redirect     off;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
       
   }

   location /fbs {



            proxy_pass http://fbs;
            proxy_set_header   Host    $host;
            proxy_set_header   X-Real-IP   $remote_addr; 
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        }

   location /socket.io/ {        
        # 此处改为 socket.io 后端的 ip 和端口即可
        proxy_pass http://fbs;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}


2.FBS启动后会向配置好的BSS获取数据库连接参数和消息队列参数。并建立连接。这些动作在IsFitInit.js中实现。


bss.config配置文件中记录了bss的地址，该文件和app.js在同一个目录下面。

下面是bss.config的例子

{"host":"http://127.0.0.1:8080","user":"admin","pswd":"123456","serverId":1}

启动时需要调用init函数，该函数将进行初始化。

isfit_gobal.init = function beginIsFit() {

    try {
    
        if(fs.existsSync('bss.config')){
        
            let data = fs.readFileSync("bss.config");
            
            data = JSON.parse(data);
            
            isfit_gobal.bssCfg = data;
            
        }
        
        
    } 
    catch (error) {
        
    }
    
    regModule(isfit_gobal.emitter);
    
}

其中regModule函数，如下：
function regModule(emitter) {

emitter.on('amq_connected', function (client) {

isfit_gobal.amqClient = client;

client.subscribe('/topic/fbs_info', onInfo);

console.log("send msg to fbs------------------");

client.sendMsg('fbs', 'hello');


})

AMQ.init(isfit_gobal.emitter);


}

当AMQ启动时会读取amq.config中关于消息队列的内容，并根据配置连接消息队列。消息队列连接成功，并获取了fbs_info消息后，onInfo函数将进行数据库的链接。
同时提供一个接口reInit来更新两个文件的配置。
