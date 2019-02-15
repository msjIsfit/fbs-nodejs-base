const init = require('./isfitInit');
const isfitCfg = require('./isfitCfg')
const isfitPro = require('./isfitProtocol')
const isfitAMQ = require('./isfitAmq')
module.exports={
    isfit_global : init,
    isfitCfg : isfitCfg,
    isfitPro : isfitPro,
    isfitAMQ : isfitAMQ,

};


function run(){
    console.log('------------------isfit---------fbs----------running---------')
    console.log(process.cwd());
    init.init();
}

run();