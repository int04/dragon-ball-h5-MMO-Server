let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');

let redisPVP = require('../chucnang/db.js');

module.exports = async function(u1,u2) {

    return new Promise( async (res,reject) => {
        if(typeof u1 != 'object') {
            u1 = await redis.getPlayer(u1);
            if(!u1) return res(false);
        }
        if(typeof u2 != 'object') {
            u2 = await redis.getPlayer(u2);
            if(!u2) return res(false);
        }
        if(u1.id == u2.id) return res(false);
    
        // kiểm tra xem có đeo cờ chiến không
        let co1 = u1.skin.coPK;
        let co2 = u2.skin.coPK;
        
        // nếu cờ khác màu nhau
        if(co1 != co2 && co1 > 0 && co2 > 0) return res(true); // đeo cờ và khác màu
        if(co1 == 9 && co2 > 0 || co2 == 9 && co1 > 0) return res(true); // cờ đen
    
    
        // kiểm tra xem có đang PVP không
        let cache = await redisPVP.getPk();
        let checkPVP = cache.pk.in.find(e => e.from == u1.id && e.to == u2.id || e.from == u2.id && e.to == u1.id);
        if(checkPVP) return res(true);
    
        return res(false);
    });

}