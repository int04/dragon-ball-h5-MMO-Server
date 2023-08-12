let redis = require('../../Model/redis.js');
let client = redis.client;

let getGiaodich = () => {
    return new Promise((resolve, reject) => {
        client.get('giaodich').then((giaodich) => {
            if(!giaodich) return resolve({
                moi: [],
                dang: [],
            });
            return resolve(JSON.parse(giaodich));
        });
    });
}

let setGiaodich = (giaodich) => {
    return new Promise((resolve, reject) => {
        client.set('giaodich', JSON.stringify(giaodich)).then(() => {
            return resolve();
        }
        );
    });

}


module.exports = {
    getPlayer : redis.getPlayer, 
    getGiaodich : getGiaodich,
    setGiaodich : setGiaodich,
    setPlayer : redis.setPlayer,

}