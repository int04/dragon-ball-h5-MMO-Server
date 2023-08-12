let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');

let playerFunction = require('../player.js')

module.exports = async function(socket,data_skill,getMySkillLevel) {
    let my = socket.my;

    let keyid = string.az(11);
    
    let listTacDung = []; 

    let listMobInZone = redis.mobInZone(my.pos.map,my.pos.zone);
    let listPlayerInZone = redis.playerInZone(my.pos.map,my.pos.zone,my.id);
    let listBossInZone = redis.bossInZone(my.pos.map,my.pos.zone);
    
    Promise.all([listMobInZone,listPlayerInZone,listBossInZone]).then(res => {
        let listMobInZone = res[0];
        let listPlayerInZone = res[1];
        let listBossInZone = res[2];

        Promise.all([

            new Promise((res,fai) => {
                Promise.all(listMobInZone.map(dataMob => {
    
                    return new Promise((resMob,FaiMOs) => {
    
                        dataMob.eff = string.eff(dataMob.eff);
                        dataMob.eff.thaiduonghasan = dataMob.eff.thaiduonghasan || {};
                        dataMob.eff.thaiduonghasan.time = Date.now() + data_skill.dame[getMySkillLevel] * 1000;
                        dataMob.eff.thaiduonghasan.active = true;
                        listTacDung.push({
                            id : dataMob.id,
                            eff : dataMob.eff,
                        });
                        redis.setMob(dataMob).then(() => {
                            resMob({
                                id : dataMob.id,
                                eff : dataMob.eff,
                            })
                        })
                        
                    })
                })).then(e => {
                    res(e);
                })
            }),
            new Promise((res,fai) => {
                Promise.all(listBossInZone.map(dataMob => {
    
                    return new Promise((resMob,FaiMOs) => {
    
                        dataMob.eff = string.eff(dataMob.eff);
                        dataMob.eff.thaiduonghasan = dataMob.eff.thaiduonghasan || {};
                        dataMob.eff.thaiduonghasan.time = Date.now() + data_skill.dame[getMySkillLevel] * 1000;
                        dataMob.eff.thaiduonghasan.active = true;
                        listTacDung.push({
                            id : dataMob.id,
                            eff : dataMob.eff,
                        });
                        
                        redis.setBoss(dataMob).then(() => {
                            resMob({
                                id : dataMob.id,
                                eff : dataMob.eff,
                            })
                        });

                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
            new Promise((res,fai) => {
                Promise.all(listPlayerInZone.map(  dataPlayer => {
    
                    return new Promise(async (resPlayer,FaiMOs) => {
                        //if(string.pk(my,dataPlayer) == false) return resPlayer(1);
                        let checked = await playerFunction(my,dataPlayer);
                        if(checked == false) return resPlayer(1);
                        if(dataPlayer.id == my.id) return resPlayer(1);

                        let tacdung  = data_skill.dame[getMySkillLevel];

                        socket.worker({
                            type : 'eff',
                            name : 'tdhs',
                            uid : dataPlayer.id,
                            time : tacdung,
                        })

    
                        resPlayer({
                            id : dataPlayer.id,
                            eff : dataPlayer.eff,
                        })
                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
    
    
    
        ]).then(listUID => {
            socket.sendMap({
                eff : listTacDung,
                _1 : my.id,
                _2 : 'thhs',
                _3 : keyid,
                _f : string.rand(1,100),
            })
        })
    })

    redis.setPlayer(my);

}