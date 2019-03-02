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

        io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
        io.set('origins', '*:*');
*/
var isfit_gobal = exports
const fs = require('fs');
/*
首先读取bss配置
regModule中扫描业务模块，调用其注册方法，并将全局事件传给业务模块

*/
const log4js = require('log4js');
let logger = log4js.getLogger(); 
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

                    let sconfig = JSON.stringify(config);
                    let ssvr = JSON.stringify(svrInfo);
                    fs.writeFileSync("amq.config", sconfig);
                    fs.writeFileSync("bss.config", ssvr);
                    logger.info("get info:" + sconfig + "\r\n" + ssvr);
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



    glob.sync(__dirname + "*.js").forEach(function (file) {

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



let programName = "isfit_fbs_app";

log4js.configure({
    appenders:{
        console:{//记录器1:输出到控制台
            type : 'console',
        },
        log_file:{//记录器2：输出到文件
            type : 'file',
            filename: __dirname + `/logs/${programName}.log`,//文件目录，当目录文件或文件夹不存在时，会自动创建
            maxLogSize : 20971520,//文件最大存储空间（byte），当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
            backups : 3,//default value = 5.当文件内容超过文件存储空间时，备份文件的数量
            //compress : true,//default false.是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
            encoding : 'utf-8',//default "utf-8"，文件的编码
        },
        data_file:{//：记录器3：输出到日期文件
            type: "dateFile",
            filename: __dirname + `/logs/${programName}`,//您要写入日志文件的路径
            alwaysIncludePattern: true,//（默认为false） - 将模式包含在当前日志文件的名称以及备份中
             daysToKeep:10,//时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            pattern: "-yyyy-MM-dd-hh.log",//（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding : 'utf-8',//default "utf-8"，文件的编码
        },
       error_file:{//：记录器4：输出到error log
            type: "dateFile",
            filename: __dirname + `/../logs/${programName}_error`,//您要写入日志文件的路径
            alwaysIncludePattern: true,//（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep:10,//时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            pattern: "_yyyy-MM-dd.log",//（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding : 'utf-8',//default "utf-8"，文件的编码
            // compress: true, //是否压缩
        }
    },
    categories: {
        default:{appenders:['data_file', 'console', 'log_file'], level:'info' },//默认log类型，输出到控制台 log文件 log日期文件 且登记大于info即可
        production:{appenders:['data_file'], level:'info'},  //生产环境 log类型 只输出到按日期命名的文件，且只输出警告以上的log
        console:{appenders:['console'], level:'debug'}, //开发环境  输出到控制台
        debug:{appenders:['console', 'log_file'], level:'debug'}, //调试环境 输出到log文件和控制台    
        error_log:{appenders:['error_file'], level:'error'}//error 等级log 单独输出到error文件中 任何环境的errorlog 将都以日期文件单独记录
    },
});

