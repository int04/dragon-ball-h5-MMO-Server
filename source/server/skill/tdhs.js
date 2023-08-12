let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');

module.exports = function(io,element,data_skill,level)
{
    let listTacDung = [];

    let listPlayerOnMap = redis.playerInZone(element.pos.map,element.pos.zone);
    listPlayerOnMap.then(abcd => {
        Promise.all([

            new Promise((res,fai) => {
                Promise.all(abcd.map(dataPlayer => {
                    return new Promise((resMob,FaiMOs) => {
                        if(dataPlayer.info.chiso.hp <= 0) return resMob(1);
                        let tacdung = data_skill.dame[level];
                        process.send({
                            since04: {
                                type : 'eff',
                                name : 'tdhs',
                                uid : dataPlayer.id,
                                time : tacdung,
                            }
                        })
                        resMob({
                            id : dataPlayer.id,
                            eff : dataPlayer.eff,
                        })
                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
    
        ]).then(listUID => {
            io.sendMap({
                eff : listTacDung,
                _1 : element.id,
                _2 : 'thhs',
                _3 : 'bossEffect',
                _f : string.rand(1,100),
            },element)
        })
    });
    return element;
}