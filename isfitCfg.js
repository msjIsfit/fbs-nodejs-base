"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let Pro = require('./isfitProtocol');
function createObjByRelation(relation, map, templateId, parentId, name, bid, svrInfo,py) {
    //{ [key: string]: ObjInfo; }
    return new Promise(((fulfill, reject) => {
        let obj = map[relation];
        if (obj && obj.obj) {
            fulfill(obj.obj.objId);
        }
        else {
            Pro.sendProtocol("createObj", svrInfo, {
                templateId: templateId,
                name: name,
                parentId: parentId,
                businessId: bid,
                py:py
            }).then((rep) => {
                if (rep && rep.result) {
                    fulfill(rep.result[0]);
                }
                else {
                    reject(rep);
                    console.error("create failed " + JSON.stringify(rep) + " " + name + " parrentId:" + parentId);
                }
            }).catch((err) => {
                reject(err);
                console.error("create failed " + name + " parrentId:" + parentId, err);
            });
        }
    }));
}
exports.createObjByRelation = createObjByRelation;
function createObj(templateId, parentId, name, bid, svrInfo,py) {
    return new Promise(((fulfill, reject) => {
        Pro.sendProtocol("createObj", svrInfo, {
            templateId: templateId,
            name: name,
            parentId: parentId,
            businessId: bid,
            py:py
        }).then((rep) => {
            if (rep && rep.result) {
                fulfill(rep.result[0]);
            }
            else {
                reject(rep);
                console.error("create failed " + JSON.stringify(rep) + " " + name + " parrentId:" + parentId);
            }
        }).catch((err) => {
            reject(err);
            console.error("create failed " + name + " parrentId:" + parentId, err);
        });
    }));
}
exports.createObj = createObj;
class ObjInfo {
}
exports.ObjInfo = ObjInfo;
function setCfgMete(objId, cfgMeteId, cfgValue, svrInfo) {
    let item = { id: { meteId: cfgMeteId, objId: objId }, meteValue: cfgValue };
    return Pro.asynSend('addResource', svrInfo, {
        name: 'CfgMeteCache',
        item: JSON.stringify(item),
        id: item.id.objId + ":" + item.id.meteId
    });
}
exports.setCfgMete = setCfgMete;
function readObj(svrInfo) {
    return new Promise(((fulfill, reject) => {
        Pro.sendProtocol("getAllMemberInResource", svrInfo, {
            name: 'obj'
        }).then((rep) => {
            if (rep && rep.result) {
                let mapObjs = {};
                //let result: { [key: string]: ObjInfo } = {};
                for (let info of rep.result) {
                    let obj = new ObjInfo();
                    obj.obj = info;
                    mapObjs[info.objId] = obj;
                    if (!info.parentId || info.parentId == '') {
                        info.parentId = '0';
                    }
                    obj.relation = info.templateId;
                }
                for (let objId in mapObjs) {
                    let obj = mapObjs[objId];
                    let parent = mapObjs[obj.obj.parentId];
                    obj.parent = parent;
                }
                fulfill(mapObjs);
            }
            else {
                reject(rep);
                console.error("readfailed---------" + JSON.stringify(rep));
            }
        }).catch((err) => {
            reject(err);
            console.error("readfailed---------" + err);
        });
    }));
}
exports.readObj = readObj;
function readObjRelationByName(svrInfo) {
    return new Promise(((fulfill, reject) => {
        readObj(svrInfo).then((mapObjs) => {
            let result = {};
            for (let objId in mapObjs) {
                let obj = mapObjs[objId];
                obj.relation = obj.obj.name;
                let parent = obj.parent;
                while (parent) {
                    obj.relation = parent.obj.name + '.' + obj.relation;
                    parent = parent.parent;
                }
                result[obj.relation] = obj;
            }
            fulfill(result);
        }).catch((error) => {
            reject(error);
        });
    }));
}
exports.readObjRelationByName = readObjRelationByName;
