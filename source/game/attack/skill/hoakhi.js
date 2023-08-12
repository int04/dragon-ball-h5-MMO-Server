let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');


module.exports = async function(socket,data_skill,getMySkillLevel) {
    let my = socket.my;

    
    my.eff.hoakhi.timeawait = Date.now() + 1000; // 10k giây
    my.eff.hoakhi.status = true; 
    my.eff.hoakhi.level = getMySkillLevel;
    my.eff.hoakhi.tacdung = data_skill.dame[getMySkillLevel];
    socket.sendMap({
        _1 : my, 
        _g : string.rand(1,100),
    })

    redis.setPlayer(my);

}