
let datamap = require("../../Model/base/map");
let quai = require("../../Model/base/quai");
let string = require("../../Model/string");

let quai_in_map = require("../../Model/base/quai_in_map");
let vaoKhu = function(map,zone)
{
   
    let findAllUserInMap = player.filter(e => e.pos.map == map && e.pos.zone == zone);
    // if length > 12 => return false
    let findMap = datamap.find(e => e.id == map);
    if(!findMap) return false;

    let maxkhu = 12;
    if(findMap.max && findMap.max >=1) maxkhu = findMap.max;

    if(findAllUserInMap.length >= maxkhu) return false;

    if(findMap) 
    {
        let info_list = quai_in_map[findMap.id];
        if(info_list) 
        {
            console.log(info_list)
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

            get_list_mob.data.forEach(idmob => {
                let inMob = mob.find(e => e.uid == idmob.id && e.pos.map == map && e.pos.zone == zone);
                if(!inMob)
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
                    if(infoQuai && idmob.pos) 
                    {
                        idmob.pos.forEach(pos => {
                            mob.push({
                                type : 'mob',
                                id : string.az(10),
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
                                

                            })
                        });
                    }
                }
            });
        }
        
    }


    return true;
}



module.exports = vaoKhu;