let string = require('../../Model/string');
let redis = require('../../Model/redis');
module.exports = function(socket,data) 
{
    socket.timeAwaitCo = socket.timeAwaitCo || 0;

    if(socket.uid <=0) return false;
    if(socket.timeAwaitCo > Date.now()) return socket.chipi('Vui lòng chờ ' + Math.round((socket.timeAwaitCo - Date.now())/1000) + ' giây nữa');


    let my = socket.my;

    if(!my) return false;

    let id = data;
    id = id >> 0;
    if(id < 0 || id > 9) socket.sendCode("error");
    my.skin.coPK = id;
    socket.timeAwaitCo = Date.now() + 60*1000;
    redis.setPlayer(my).then(() => {
        socket.sendMap({id : my.id, skin : my.skin},'skin_map');
    })


}