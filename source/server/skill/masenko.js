let string = require('../../Model/string.js');
let kill = require('./kill.js');
let bossBase = require('../../Model/base/boss.js');
let redis = require('../../Model/redis.js');
module.exports = async function(io,element,data_skill,level)
{
    let infoBoss = bossBase.find(e => e.id == element.uid);
    let victim = element.victim;
    if(victim.length >=1)
    {
        redis.getPlayer(victim[0]).then(sql => {
            if(sql) {
                if(sql.info.chiso.hp >=1 && sql.pos.map == element.pos.map && sql.pos.zone == element.pos.zone)
                {
                    io.sendMap({
                        _1 : element.id,
                        _2 : 'mabasapo masenkooooo',
                        _h : string.rand(1,100),
                    },element)
                    let solan =  data_skill.solan[level];
                    for(let i = 0; i< solan; i++) 
                    {
                        let my = element;
                        let dame = my.info.chiso.kiFull/100 * 50;
                        dame += my.info.chiso.sucdanh; 
                        let damebouns = dame/100*105;
                        dame = string.rand(dame,damebouns);
                        dame = Math.round(dame);
                        let newid = string.az(10);
                        dame = dame - sql.info.chiso.giap;
                        
                        let users = sql;
                
                        
                
                
                        setTimeout(() => {
                
                            kill(io,element,dame,users,infoBoss);
                
                            io.sendMap({
                                _1 : element.id,
                                _4 : sql.id,
                                _2 : 'masenko',
                                _3 : 'bossattack',
                                _f : string.rand(1,100),
                            },element)
                        }, 200 * i);
                
                    }
                }
                
            }
        });
    }

   

    

    return element;
}