let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');


module.exports = async function(socket,data_skill,getMySkillLevel) {
    let my = socket.my;

    let keyid = string.az(11);
    
    let time = data_skill.dame[getMySkillLevel];
    let chan = data_skill.chan[getMySkillLevel];
    my.eff.khieng.time = Date.now() + time * 1000;
    my.eff.khieng.active = true;
    my.eff.khieng.chan = chan;
    socket.sendMap({
        eff : [{id : my.id, eff : my.eff}],
    })

    redis.setPlayer(my);

}