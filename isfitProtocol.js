"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rp = require('request-promise');
//const sqlite3 = require("sqlite3").verbose();
const lowDB = require('lowdb');

exports.servers = null;
exports.protocols = null;
exports.db = null;
function prepare() {
    //var fs = require("fs");
    var file = __dirname + "/db/protocol.json";
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync(file)


    let db = lowDB(adapter);
    db.defaults({ protocol: [], server: []}).write()
    exports.db = db;
    exports.protocols = db.get('protocol'); 
    exports.servers = db.get('server');
    
    //refreshData();
}
/*
function refreshData() {
    //getInfo("select * from server", exports.servers);
    getInfo("select * from protocol", exports.protocols);
}*/
//exports.refreshData = refreshData;
function saveProtocol(info) {
    if (info) {
        if(exports.protocols){
            exports.protocols.remove({name:info.name}).write();
            exports.protocols.push(info).write();
        }
    }
}
exports.saveProtocol = saveProtocol;
function saveServer(info) {
    if (info) {
        if(exports.servers){
            exports.servers.remove({name:info.name}).write();
            exports.servers.push(info).write();
        }
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
                else{
                    fulfill({});
                }
            }
        }).catch((error) => {
            reject(error);
            console.error("error", error);
        });
    }));
}
let crypto = require('crypto');

function getTokenFromResp(response){
    if(response){
        let headers = response['headers'];
        if(headers){
            let token = headers['Authorization'];
            if(token){
                return token;
            }
            return headers['authorization']
        }
    }
    return null;
}

function getToken(svrInfo){
    let md5 = crypto.createHash('md5');
    let options = {
        uri: svrInfo.host + "/login/",
        method: 'POST',
        json: true,
        body:{jsonRPC:'2.0',method:'',id:'',params:{userName:svrInfo.user,paswd:md5.update(svrInfo.pswd).digest('hex')}},
        transform: function (body, response, resolveWithFullResponse) {
            let token = getTokenFromResp(response);
            if(token){
                svrInfo.token = token;
            }
            return body;
        }
    };
    return new Promise((fulfill,reject)=>{
        rp(options).then((res)=>{
            if(!res.error && svrInfo.token){
                fulfill(svrInfo);
            }
            else{
                reject(res.error);
            }
            
        }).catch(err=>{
            reject(err);
        })
    })
    
}

exports.asynSend = asynSend;
function sendProtocol(name,svrInfo,params){
    return new Promise(((fulfill, reject) => {
        sendProtocolImp(name, svrInfo, params).then((rep) => {
            if (rep) {
               
                if (rep.result) {
                    fulfill(rep);

                }
                
                else if (rep.error) {
                    console.error(JSON.stringify(rep) + " request :" + JSON.stringify(params));
                    reject(rep);
                }
                else{
                    fulfill(rep);
                }
            }
        }).catch((error) => {
            if(error.statusCode == 401){
                getToken(svrInfo).then(
                    sendProtocolImp(name,svrInfo,params).then((response)=>{
                        if(response.result){
                            fulfill(response);
                        }
                        else if(response){
                            reject(response.error);
                        }
                        else{
                            fulfill(response);
                        }
                        
                    })
                ).catch(err=>{
                    reject(err)
                });
            }
            else{
                reject(error);
                console.error("sendProtocol error", error);
            }
           
        });
    }));
}
function sendProtocolImp(name, svrinfo, params) {
    if (svrinfo && exports.protocols) {

        let template = exports.protocols.find({name:name});
        if(template){
            template = template.value();
        }
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
                if(pbody){
                    body = JSON.parse(pbody);
                }
                else{
                    body = null;
                }
                
            }
            if(url){
                let options = {
                    uri: svrinfo.host + "/" + encodeURI(url),
                    method: template.method,
                    json: true,
                    body: body,
                    transform: function (body, response, resolveWithFullResponse) {
                        let token  = getTokenFromResp(response);
                        if(token){
                            svrinfo.token = token;
                        }
                        return body;
                    }
                };
                if(svrinfo.token){
                    if(options['headers']){
                        options['headers']['Authorization'] = svrinfo.token
                    }
                    else{
                        options['headers'] = {'Authorization':svrinfo.token};
                    }
                   

                }
                console.log("send protocol " + options.uri + " " +  options.method);
                return rp(options);

            }
           
            
        }        
    }
    return new Promise(function(resolve, reject) {
        let err = "protocol not found " + name;
        console.error(err);
        reject(err);
      });

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
