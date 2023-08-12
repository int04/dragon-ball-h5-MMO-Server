let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');

let playerFunction = require('../player.js');

module.exports = async function(socket,data_skill,getMySkillLevel) {
    let my = socket.my;

    let keyid = string.az(11);
    
    let listTacDung = [];
    let hpthem = 0;
    let listMobInZone = redis.mobInZone(my.pos.map,my.pos.zone);
    let listPlayerInZone = redis.playerInZone(my.pos.map,my.pos.zone);

    let listBoss = redis.bossInZone(my.pos.map,my.pos.zone);

    let timeRun = Date.now();

    Promise.all([listMobInZone, listPlayerInZone, listBoss]).then((resposive) => {
        listMobInZone = resposive[0];
        listPlayerInZone = resposive[1];
        listBoss = resposive[2];
        Promise.all([

            new Promise((res,fai) => {
                Promise.all(listBoss.map(dataMob => {
    
                    return new Promise((resMob,FaiMOs) => {
    
                        hpthem+= dataMob.info.chiso.hp/100*10;
                        listTacDung.push({id : dataMob.id, type : 'boss'})
                        resMob(1)
                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
    
            new Promise((res,fai) => {
                Promise.all(listMobInZone.map(dataMob => {
    
                    return new Promise((resMob,FaiMOs) => {
    
                        hpthem+= dataMob.info.chiso.hp/100*10;
                        listTacDung.push({id : dataMob.id, type : 'mob'})
                        resMob(1)
                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
    
            new Promise((res,fai) => {
                Promise.all(listPlayerInZone.map(dataPlayer => {
    
                    return new Promise(async (resPlayer,FaiMOs) => {
                        if(dataPlayer.id == socket.uid) return resPlayer(1);

                        let checked = await  playerFunction(my,dataPlayer);
                        if(checked) {
                            listTacDung.push({id : dataPlayer.id, type : 'player'})
                        }
    
                        hpthem+= dataPlayer.info.chiso.hp/100*10;
    
                        resPlayer(1)
                    })
    
    
                })).then(e => {
                    res(e);
                })
            }),
    
    
        ]).then( async listUID => { 

            console.log('listTacDung',listTacDung)
    
            console.log('Chạy boom');
            let dame = my.info.chiso.hpFull/100 * data_skill.dame[getMySkillLevel];
            dame += hpthem;
            let damebouns = dame/100*105;
            dame = string.rand(dame,damebouns);
            dame = Math.round(dame);
            let newid = string.az(10);

            await redis.setSkill({
                keyid : newid,
                from : socket.uid,
                to : socket.uid,
                value : dame,
                type : 'truhp',
                loai : 'player',
            });


            let listArray = []
    
            listTacDung.forEach(e => {
                listArray.push(
                    redis.setSkill({
                        keyid : newid,
                        from : socket.uid,
                        to : e.id,
                        value : dame,
                        type : 'truhp',
                        loai : e.type
                    })
                );
            });


            let awaitList = await Promise.all(listTacDung);



    
            socket.sendMap({
                _f : string.rand(1,100),
                _1 : my.id,
                _2 : 'boom',
                _3 : newid,
            })

            console.log('Time run boomm',Date.now() - timeRun,'ms');
        })
    })

    redis.setPlayer(my);

}