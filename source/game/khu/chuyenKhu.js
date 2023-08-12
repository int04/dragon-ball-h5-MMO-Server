let redis = require('../../Model/redis.js');
let datamap = require("../../Model/base/map");

let quai = require("../../Model/base/quai");
let quai_in_map = require("../../Model/base/quai_in_map");
let string = require("../../Model/string");

let createQuai = function(map,zone)
{
    return new Promise((resolve, reject) => {
        let info_list = quai_in_map[map];
        if(info_list)
        {
            let get_list_mob = {
                list : info_list,
            }
            if(get_list_mob.list) 
            {
                get_list_mob.data = [];
                for(let idquai in get_list_mob.list) 
                {
                    get_list_mob.data.push({
                        id : idquai,
                        x : get_list_mob.list[idquai],
                    })
                }
            }
            Promise.all(get_list_mob.data.map(idmob => {

                return new Promise((resolve2, reject2) => {
                    redis.mobCheckUid(map,zone,idmob.id).then(list => {
                        if(list.length <=0) 
                        {
                            let infoQuai = quai.find(e => e.id == idmob.id);
                            if(idmob.x) 
                            {
                                idmob.pos = [];
                                idmob.x.forEach((xy,count) => {
                                    if(count%2 == 0) 
                                    {
                                        idmob.pos.push({
                                            x : xy,
                                            y : idmob.x[count+1],
                                        })
        
                                    }
                                });
        
                            }

                            if(infoQuai && idmob.pos) {

                                Promise.all(idmob.pos.map(pos => {
                                    return new Promise((resolve3, reject3) => {
                                        let redisID = string.az(10);
                                        let json = { 
                                            type : 'mob',
                                            id : redisID,
                                            timedelete: Date.now() + 100000,
                                            name : infoQuai.name,
                                            uid : infoQuai.id,
                                            namdat : infoQuai.namdat,
                                            exp : infoQuai.exp,
                                            eff : {
                                                choang :  {active : false, time : 0},
                                                taitaonangluong : {active : false, time : 0},
                                                thaiduonghasan :  {active : false, time : 0},
                                                hoakhi : {active : false, time : 0, timeawait : 0, status : false},
                                                khieng : {active : false, time : 0},
                                                rungu : {active : false, time : 0},
                                            },
                                            skin : {
                                                ao : infoQuai.trangbi.ao,
                                                quan : infoQuai.trangbi.quan || "tWNvFxfloN",
                                                dau : infoQuai.trangbi.dau || "GaMtSOeboy",
                                            }, 
                                            info : {
                                                chiso :{
                                                    hp : infoQuai.chiso.hpFull,
                                                    hpFull : infoQuai.chiso.hpFull,
                                                    sucdanh : infoQuai.chiso.sucdanh,
                                                    giap : infoQuai.chiso.giap,
                                                    ki : infoQuai.chiso.kiFull,
                                                    kiFull : infoQuai.chiso.kiFull,
                                                    
                                                },
                                                coban : {
                                                    avatar : "516",
                                                    sucmanh : 100,
                                                },
                                                'act' : 'attack',
                                                'move' : 'right',
                                                speed : infoQuai.speed,
                                                
                                            },
                                            time : {
                                                timehoisinh : 0,
                                                timedanh : 0,
                                            },
                                            victim : [], // đối tượng đã đánh
                                            pos : {
                                                map : map,
                                                zone : zone,
                                                x : pos.x, 
                                                y : pos.y,
                                                xMin : pos.xMin || pos.x - 100,
                                                xMax : pos.xMax || pos.x + 100,
                                                yMin : pos.yMin,
                                                yMax : pos.yMax,
                                            },
                                        };
                                        redis.setMob(redisID,json).then(success => {
                                            resolve3(true);
                                        });
                                    })
                                })).then(success => {
                                    resolve2(true);
                                });

                            }
                            else 
                            {
                                resolve2(true);
                            }

                        }
                        else 
                        {
                            resolve2(true);
                        }
                    });
                });

            })).then(() => {
                resolve(true);
            });
        }
        else 
        {
            resolve(true);
        }
    });
}



let inLog = function (map,zone,socket) 
{
    let findMap = datamap.find(e => e.id == map);
        

    return new Promise((resolve, reject) => {
        let player = redis.playerInZone(map,zone);
        let mobCreate = createQuai(map,zone);

        Promise.all([player, mobCreate]).then(data => {
        
            if(!findMap)  resolve(false);
            let maxkhu = 12;
            if(findMap.max && findMap.max >=1) maxkhu = findMap.max;
        
            if(data[0].length >= maxkhu) resolve(false);
    
            socket.leaveMap();
            socket.joinMap(map,zone);
    
            resolve(true)
        })
    });

}


let checked = function (map,zone) 
{
    let findMap = datamap.find(e => e.id == map); 
        

    return new Promise((resolve, reject) => {
        let player = redis.playerInZone(map,zone);
        let mobCreate = createQuai(map,zone);

        Promise.all([player,mobCreate]).then(data => {
        
            if(!findMap)  resolve(false);
            let maxkhu = 12;
            if(findMap.max && findMap.max >=1) maxkhu = findMap.max;
        
            if(data[0].length >= maxkhu) resolve(false);
    
            resolve(true)
        })
    });

}


module.exports =  {
    inLog : inLog,
    checked : checked,
}