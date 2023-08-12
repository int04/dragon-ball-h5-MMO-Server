let redis = require('../../Model/redis.js');
let client = redis.client;

let getPk = () => {
    return new Promise((resolve, reject) => {
        client.get('pk').then((giaodich) => {
            if(!giaodich) return resolve({
                pk : {
                    moi: [],
                    in: [],
                }
            });
            return resolve(JSON.parse(giaodich));
        });
    });
}

let setPk = (data) => {
    return new Promise((resolve, reject) => {
        client.set('pk', JSON.stringify(data)).then(() => {
            return resolve();
        }
        );
    });

}


module.exports = {
    getPlayer : redis.getPlayer, 
    getPk : getPk,
    setPk : setPk,
    setPlayer : redis.setPlayer,

}