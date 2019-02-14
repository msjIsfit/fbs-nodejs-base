const init = require('./isfitInit');
const amq = require('./isfitAmq');
const protocol = require('./isfitProtocol');

function run(){
    console.log('------------------isfit---------fbs----------running---------')
    console.log(process.cwd());
    init.init();
}

run();