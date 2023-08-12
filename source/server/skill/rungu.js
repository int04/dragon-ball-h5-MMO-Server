let string = require('../../Model/string.js');

module.exports = function(io,element,data_skill,level) 
{
    let users = player.find(e => e.id == element.victim[0] && e.pos.map == element.pos.map && e.pos.zone == element.pos.zone);
    if(users)
    {
        let time = data_skill.dame[level];
        users.eff.rungu = {};
        users.eff.rungu.time = Date.now() + time * 1000;
        users.eff.rungu.active = true;
        io.sendMap({
            eff : [{id : users.id, eff : users.eff}],
        },element)
    }

    return element;
}