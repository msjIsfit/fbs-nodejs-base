const init = require('./isfitInit');

module.exports={
    isfit_global : init
};


function run(){
    console.log('------------------isfit---------fbs----------running---------')
    console.log(process.cwd());
    init.init();
}

run();