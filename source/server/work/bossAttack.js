let getMy = require('./getMy');
let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');
let playerDie = require('./playerDie.js');
module.exports = function (io,data) {

    let player = getMy(io,data.uid);
    if(!player) return false;

    let dame = data.dame;

    
    let users = player.my; 
    //console.log('users hp',users.info.chiso.hp)
    let element = data.element;

    users.eff = string.eff(users.eff);
    if(users.eff.khieng.active == true)
    {
        if(users.eff.khieng.chan <= dame) 
        {
            users.eff.khieng.vo = true;
            dame = 0;
        }
        else 
        {
            dame = 0;
        }
    }
    
    if(users.info.chiso.hp >= 1 && users.info.chiso.hp - dame <= 0) {
        playerDie(player,element,'boss');
    }

    users.info.chiso.hp -= dame;
    //console.log('users hp',users.info.chiso.hp,'userID',users.id)
    if(users.info.chiso.hp <= 0) users.info.chiso.hp = 0;
    
    redis.updatePlayer(users).then((res) => {
    })

    player.sendMap({
        _1 : element.id,
        _2 : users.id,
        _3 : dame,
        _4 : 'truhp',
        _5 : {
            hp : element.info.chiso.hp,
            ki : element.info.chiso.ki,
            kiFull : 0,
            hpFull : 0,
        }, 
        _6 : {
            hp : users.info.chiso.hp,
            ki : users.info.chiso.ki,
            kiFull : users.info.chiso.kiFull,
            hpFull : users.info.chiso.hpFull,
            sucmanh : users.info.coban.sucmanh,
            tiemnang : users.info.coban.tiemnang,
        },
        _e : string.rand(1,100), // gửi tới id này
    });

 

}