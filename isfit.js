const init = require('./isfitInit');
const isfitCfg = require('./isfitCfg')
const isfitPro = require('./isfitProtocol')
module.exports={
    isfit_global : init,
    isfitCfg : isfitCfg,
    isfitPro : isfitPro
    
};


function run(){
    console.log('------------------isfit---------fbs----------running---------')
    console.log(process.cwd());
    init.init();
}

run();