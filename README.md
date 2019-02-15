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


