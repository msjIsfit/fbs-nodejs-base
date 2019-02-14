"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rp = require('request-promise');
const sqlite3 = require("sqlite3").verbose();
let db = null;
exports.servers = {};
exports.protocols = {};
exports.db = null;
function prepare() {
    var fs = require("fs");
    var file = "db/protocol.db";
    var exists = fs.existsSync(file);
    if (!exists) {
        console.log("Creating DB file.");
        fs.openSync(file, "w");
    }
    db = new sqlite3.Database(file);
    exports.db = db;
    refreshData();
}
function refreshData() {
    //getInfo("select * from server", exports.servers);
    getInfo("select * from protocol", exports.protocols);
}
exports.refreshData = refreshData;
function saveProtocol(info) {
    if (info) {
        let sql = `insert into protocol(name,method,body,url) 
                values('${info.name}','${info.method}','${info.body}','${info.url}')`;
        db.run(sql);
    }
}
exports.saveProtocol = saveProtocol;
function saveServer(info) {
    if (info) {
        let sql = `insert into server(name,host,user,pswd,note)  
            values('${info.name}','${info.host}','${info.user}','${info.pswd}','${info.note}')`;
        db.run(sql);
    }
}
exports.saveServer = saveServer;
function asynSend(name, svrInfo, params) {
    return new Promise(((fulfill, reject) => {
        sendProtocol(name, svrInfo, params).then((rep) => {
            if (rep) {
                if (rep.result) {
                    fulfill(rep.result);
                }
                else if (rep.error) {
                    console.error(JSON.stringify(rep) + " request :" + JSON.stringify(params));
                    reject(rep.error);
                }
            }
        }).catch((error) => {
            reject(error);
            console.error("error", error);
        });
    }));
}
exports.asynSend = asynSend;
function sendProtocol(name, svrinfo, params) {
    if (svrinfo && exports.protocols) {
        let template = exports.protocols[name];
        let body = null;
        let url = '';
        if (template) {
            url = template.url;
            if (template.body || url) {
                let pbody = template.body;
                for (let tname in params) {
                    let value = params[tname] ? params[tname] : "";
                    if (pbody) {
                        pbody = pbody.replace("??" + tname + "??", value);
                    }
                    if (url) {
                        url = url.replace("??" + tname + "??", value);
                    }
                }
                body = JSON.parse(pbody);
            }
            let options = {
                uri: svrinfo.host + "/" + encodeURI(url),
                method: template.method,
                json: true,
                body: body
            };
            return rp(options);
        }
    }
}
exports.sendProtocol = sendProtocol;
prepare();
function getInfo(sql, infos) {
    db.each(sql, function (err, row) {
        if (!err) {
            infos[row.name] = row;
            //console.log(rows);
        }
        else {
            console.error(err);
        }
    });
}
exports.getInfo = getInfo;
