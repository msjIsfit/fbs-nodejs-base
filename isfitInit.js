"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
isfit_gobal包括如下成员
isfit_gobal.emitter事件
isfit_gobal.mongodb mongoDB连接
isfit_gobal.mysql mysql连接
isfit_gobal.redis 内存数据库
isfit_gobal.mysqlParm mysql配置
isfit_gobal.mongodbPram mongodb配置
isfit_gobal.bssCfg bss配置

*/
var isfit_gobal = exports
const fs = require('fs');
/*
首先读取bss配置
regModule中扫描业务模块，调用其注册方法，并将全局事件传给业务模块

*/
isfit_gobal.init = function beginIsFit() {
    try {
        if(fs.existsSync('bss.config')){
            let data = fs.readFileSync("bss.config");
            data = JSON.parse(data);
            isfit_gobal.bssCfg = data;
        }
        
        
    } catch (error) {
        
    }
    
    regModule(isfit_gobal.emitter);
}

isfit_gobal.attach = function attach() {
    glob.sync(__dirname + "/*.js").forEach(function (file) {

        if (file != './' && file.indexOf('isfitInit.js') == -1
            && file.indexOf('Amq.js') == -1) {
            var m = require(path.resolve(file));
            if (m) {
                if (m.attach) {
                    console.log("begin frame ----------attach ==============" + file);
                    m.attach(isfit_gobal);
                    console.log("begin attach ==========finished====" + file);
                    //m = null;
                }
            }

        }

    });
}

function addFBS(PRO, svrInfo, amqCfg, succ) {
    //let PRO = require('./isfitProtocol');
    //let svrInfo = {host:bssHost,user:userName,pswd:password};
    PRO.sendProtocol('fbsInfo', svrInfo)
        .then((res) => {
            let result = res.result;
            let empty = !result;
            if (!empty) {
                if ("no adaptor" == result) {
                    empty = true;
                }
            }
            if (empty) {
                let cfg = require('./isfitCfg');
                cfg.createObj('117', 0, 'fbs', '', svrInfo).then((id) => {
                    if (id > 0) {
                        PRO.sendProtocol('addGateway', svrInfo, {
                            gatewayId: id,
                            ip: amqCfg.ip, port: amqCfg.port + 3,
                            userName: amqCfg.user,
                            password: amqCfg.pass,
                            serverId: svrInfo.serverId
                        })
                            .then((res) => {
                                succ();
                            })
                    }
                });

            }
            else {
                succ();
            }
        }

        )

}

function readStr(worksheet,grid){
    var value = worksheet[grid];
    if(value){
        return value.v;
    }
    return '';
}

isfit_gobal.reInit = function (bssHost, userName, password, templateDir,response) {
    let PRO = require('./isfitProtocol');
    let svrInfo = { host: bssHost, user: userName, pswd: password };
    let config = null;
    PRO.sendProtocol('svrInfo', svrInfo)
        .then((res) => {
            if (res.result) {
                let result = res.result;
                if (result && result.amq && result.serverInfo) {
                    svrInfo.serverId = result.serverInfo.serverId;
                    result = result.amq;
                    let parts = result.uri.split(":");
                    let ip = "";
                    let port = 0;
                    if (parts.length >= 2) {
                        ip = parts[1].replace("//", "");
                    }
                    if (result.port) {
                        port = result.port - 3;
                    }

                    
                    config = { ip: ip, port: port, user: result.userName, pass: result.password };
                    fs.writeFileSync("amq.config", JSON.stringify(config));
                    fs.writeFileSync("bss.config", JSON.stringify(svrInfo));
                    if (templateDir) {

                        //var fileDirectory = "d:\\coorsjson";
                        if (fs.existsSync(templateDir)) {
                            let files = fs.readdirSync(templateDir);

                            const XLSX = require("xlsx");
                            const crypto = require('crypto');

                            files.forEach(function (filename) {
                                const workbook = XLSX.readFile(templateDir + "/" + filename);
                                const worksheet = workbook.Sheets['template'];
                                var ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
                                var reg = /[a-zA-Z]/g;
                                ref = ref.replace(reg, "");
                                var line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
                                for (var i = 2; i <= line; i++) {
                                    var templateId = readStr(worksheet,'A' + i);
                                    //var templateName = worksheet['B' + i].v || '';
                                    var tbody = readStr(worksheet,'D' + i);
                                    if(tbody == '')
                                    {
                                        continue;
                                       
                                    }
                                    tbody = JSON.stringify(tbody);
                                    if(tbody.length < 2){
                                        continue;
                                    }
                                    tbody = tbody.substr(1,tbody.length - 2);

                                    var md5A = crypto.createHash('md5');
                                    var md5 = md5A.update(tbody).digest('hex');
                                   
                                    var className = readStr(worksheet,'E' + i);
                                    
                                    
                                    (async () => {
                                        try {
                                            await PRO.asynSend('addTemplate', svrInfo, {
                                                body: tbody, templateId: templateId,
                                                className: className, md5: md5
                                            });
                                            
                                        } catch (error) {
                                            console.error(error);
                                        }
                                        
                                    })()


                                }

                            });
                        }
                    }
                    addFBS(PRO, svrInfo, config, function () {
                        response.send('OK');
                        process.exit();
                    });


                }
                else{
                    response.send('error server not support');
                }
                

            }
        });
}


var glob = require('glob')
    , path = require('path');
function initModule(emitter, port) {



    glob.sync(pathInit + "*.js").forEach(function (file) {

        if (file != './' && file.indexOf('isfitInit') == -1
            && file.indexOf('Amq.js') == -1) {
            var m = require(path.resolve(file));
            if (m) {
                if (m.init) {
                    console.log("begin frame ----------init ==============" + file);
                    m.init(isfit_gobal);
                    console.log("begin init ==========finished====" + file);
                    //m = null;
                }
            }

        }

    });

    //isfit_gobal.emitter.emit('frame_ready')
}
//var mongoParam;

let mongoParam = { host: '', credential: { username: '', password: '', source: '' } };
let mysqlParam = { user: 'admin', password: 'admin', url: '', db: '' };
function isMongoParamEqual(p1, p2) {
    if (p1 && p2 && p1.credential && p2.credential) {
        if (p1.host != p2.host || p1.credential.userName != p2.credential.userName
            || p1.credential.password != p2.credential.password) {
            return false;
        }
        return true;

    }
    return false;

}

function isMysqlParamEqual(p1, p2) {
    if (p1 && p2 && p1.url == p2.url && p1.user == p2.user && p1.password == p2.password) {
        return true;
    }
    return false;
}

let init = true;
let pathInit = ""
const mysql = require('mysql2')

function onInfo(msg) {
    if (!msg || msg.length == 0) {
        return;
    }
    try {

        let dbParam = JSON.parse(msg);
        if (!isMysqlParamEqual(dbParam.mysql, mysqlParam)) {
            let url = dbParam.mysql.url.replace("jdbc:", "");
            const urlParse = require('url').parse;
            let params = urlParse(url);

            isfit_gobal.mysql = mysql.createPool({
                host: params.hostname,
                user: dbParam.mysql.user,
                password: dbParam.mysql.password,
                database: params.pathname.replace("/", ""),
                port: params.port
            });
            

            mysqlParam = dbParam.mysql;
            isfit_gobal.mysqlParam = dbParam;
            console.log("db connecting---------------" + JSON.stringify(mysqlParam));
            isfit_gobal.emitter.emit("mysqlReady", isfit_gobal.mysql);


        }
        if (!isMongoParamEqual(dbParam.mongoDB, mongoParam)) {

            let url = "mongodb://" + dbParam.mongoDB.credential[0].userName + ":" +
                dbParam.mongoDB.credential[0].password + "@" + dbParam.mongoDB.host + "/?authSource=" +
                dbParam.mongoDB.credential[0].source;
            mongoParam = dbParam.mongoDB;
            isfit_gobal.mongoClient = require('mongodb').MongoClient;
            isfit_gobal.mongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
                if (err) throw err;
                if (init) {
                    console.log("db connecting---------------" + JSON.stringify(mongoParam));
                    isfit_gobal.mongoParam = mongoParam;
                    init = false;
                    isfit_gobal.mongodb = db;
                    isfit_gobal.emitter.emit("mongoReady", isfit_gobal.mongoDB);
                    glob.sync("./fbs/*.js").forEach(function (file) {

                        if (file != './' && file.indexOf('isfit_init.js') == -1) {

                            var m = require(path.resolve(file));
                            if (m) {
                                if (m.reg) {
                                    console.log("begin bss ----------reg ==============" + file);
                                    m.reg(isfit_gobal);
                                    console.log("begin bss ==========reg====" + file);
                                }
                            }

                        }

                    });
                    initModule(isfit_gobal.emitter);
                }

            });
        }

    }
    catch (err) {
        console.log(err);

    }





}
let events = require("events");
isfit_gobal.emitter = new events.EventEmitter();
//isfit_gobal.emiter = emitter;
let AMQ = require('./isfitAmq')
function regModule(emitter) {

   
    emitter.on('amq_connected', function (client) {
        isfit_gobal.amqClient = client;
        client.subscribe('/topic/fbs_info', onInfo);
        console.log("send msg to fbs------------------");
        client.sendMsg('fbs', 'hello');


    })
    AMQ.init(isfit_gobal.emitter);

}


