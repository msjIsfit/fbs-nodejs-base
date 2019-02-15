let pro = require('../isfitProtocol')
let should = require('should');
describe('module', function () {
    describe('asynSend', function () {
      it('asynSend should success', function () {
        pro.saveProtocol({name:'test',url:'s?word=??sword??',method:'GET'});
        pro.asynSend('test',{host:"http://www.baidu.com"},{sword:'1234'}).
            should.be.fulfilled().then(function (it) {
          })
        });
        it('asynSend but url baidu33 should failed', function () {
            pro.saveProtocol({name:'test',url:'s?word=??sword??',method:'GET'});
            pro.asynSend('test',{host:"http://www.baidu33.com"},{sword:'1234'}).
               then(function (it) {

              }).catch((err)=>{
                  console.error(err);

              });
            });

            it('asynSend test2 but protocol not found should failed', function () {
                pro.saveProtocol({name:'test',url:'s?word=??sword??',method:'GET'});
                pro.asynSend('test2',{host:"http://www.baidu.com"},{sword:'1234'}).
                    then(function (it) {
                  }).catch((err)=>{

                    console.error(err);
                  });
            });
  })
});