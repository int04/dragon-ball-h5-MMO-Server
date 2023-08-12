let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');
module.exports = async function(io,element,dame,users,infoBOSS) {
    /**
     * @param {number} dame => attack
     * @param {object} users => player
     * @param {object} infoBOSS => info database bot
     * @param {object} element => info BOSS
     * @param {object} io => socket.io
     * 
     */

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

    if(users.info.chiso.hp - dame <=0 && element.info.chiso.hp >=1)
    {
        users.info.chiso.hp = 0;
        element.victim = [];
        // thống báo nếu có
        if(infoBOSS.chat.kill.length > 0)
        {
            let noidung = infoBOSS.chat.kill[string.rand(0,infoBOSS.chat.kill.length-1)];
            // repace $ to users.name 
            noidung = noidung.replace('$',users.name);
            element.timeChat = Date.now() + infoBOSS.chat.delay;
            io.sendMap({
                _1 : element.id,
                _2 : noidung,
                _h : string.rand(1,100),
            },element)

        }
    }

    process.send({
        since04 : {
            type : 'boss_attack',
            uid : users.id,
            dame : dame,
            bossID : element.id,
            infoBOSS : infoBOSS,
            element : element,
        }
    });    

    
}