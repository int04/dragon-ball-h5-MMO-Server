let string = require('../../Model/string.js');
let kill = require('./kill.js');
let bossBase = require('../../Model/base/boss.js');
const redis = require('../../Model/redis.js');
module.exports = function(io,element,data_skill,level)
{
    let infoBoss = bossBase.find(e => e.id == element.uid);
    let my = element;
    let listTacDung = [];
    let hpthem = 0;

    io.sendMap({
        _1 : element.id,
        _2 : '...',
        _h : string.rand(1,100),
    },element)

    io.sendMap({
        _f : string.rand(1,100),
        _1 : my.id,
        _2 : 'boom',
        _3 : 'bossattack',
    },my)

    setTimeout(() => {
        
        redis.playerInZone(my.pos.map,my.pos.zone).then(listPlayerInZone => {
            Promise.all([

    
                new Promise((res,fai) => {
                    Promise.all(listPlayerInZone.map(dataPlayer => {
        
                        return new Promise((resPlayer,FaiMOs) => {
        
                            hpthem+= dataPlayer.info.chiso.hpFull/100*10;
                            listTacDung.push({id : dataPlayer.id, type : 'player'})
        
                            resPlayer(1)
                        })
        
        
                    })).then(e => {
                        res(e);
                    })
                }),
        
        
            ]).then(async listUID => {
        
                let dame = my.info.chiso.hpFull/100 * data_skill.dame[level];
                dame += hpthem;
                let damebouns = dame/100*105;
                dame = string.rand(dame,damebouns);
                dame = Math.round(dame);
                let newid = string.az(10);
                
                for(let e of listTacDung) {
                    if(e.type == 'player') {
                        let users = await redis.getPlayer(e.id);
                        if(users && users.info.chiso.hp > 0 && users.pos && users.pos.map == my.pos.map && users.pos.zone == my.pos.zone) {
                            kill(io,my,dame,users,infoBoss);
                            console.log('Chết luôn')
                        }
                    }
                }
        
                
            })
        });

    }, 5000);

    return element;
}