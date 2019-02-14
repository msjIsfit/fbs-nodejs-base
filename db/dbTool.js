let sqlite3 = require('sqlite3').verbose();
let pro = require('../isfitProtocol')

let sdb = new sqlite3.Database(__dirname + '/protocol.db');
if(sdb){
    sdb.all("SELECT * from protocol", function(err, rows) {
        rows.forEach(function (row) {
            pro.saveProtocol(row);
        });
        
    });
    sdb.all("select * from server",function(err,rows){
        rows.forEach(function(row){
            pro.saveServer(row);
        })
    })
}