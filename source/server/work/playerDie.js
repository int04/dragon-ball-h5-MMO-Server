let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');

let redisPVP = require('../../game/chucnang/db.js');

module.exports =  function(socket,nguoigiet,typeNguoi) {

    // when you die = ]
    let my = socket.my;

    let pvp = redisPVP.getPk();

    Promise.all([pvp]).then(async res => {
        // Hoạt động PVP
        let cache = res[0];

        let pvpIndex = cache.pk.in.findIndex(e => e.from == my.id || e.to == my.id);
        let pvp = cache.pk.in[pvpIndex];
        if(pvp) 
        {
            let vang = Math.round(pvp.vang * 1.90);
            let users_win = 0; 
            if(my.id == pvp.from) users_win = pvp.to;
            if(my.id == pvp.to) users_win = pvp.from;
            let get = await redis.getPlayer(users_win);
            if(get) {
                process.send({
                    since04 : {
                        type : 'player',
                        object : 'vang',
                        value : vang,
                        uid : users_win,
                    }
                })
                socket.sendToChipi('Bạn đã giành chiến thắng trước đối thủ.Bạn nhận được '+string.number_format(vang)+'',users_win);
                socket.sendToChipi('Bạn thua cuộc',my.id);
                cache.pk.in.splice(pvpIndex,1);
                redisPVP.setPk(cache);
            }
    
        }

    });

}