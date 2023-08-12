let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');

let success = require('../success.js');

module.exports = async function(socket,data_skill) {
    let my = socket.my;

    my.eff[data_skill.obb].time = Date.now() + 10000; // 10k giây
    my.eff[data_skill.obb].active = true;

    socket.sendMap({
        _1 : my, 
        _g : string.rand(1,100),
    })

    redis.setPlayer(my);

}