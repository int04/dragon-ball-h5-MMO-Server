let redis = require('../../Model/redis.js');

module.exports = function(socket,data) 
{
    if(socket.uid <=0) return socket.sendCode(-999);

    let my = socket.my;

    if(!my) return socket.sendCode(-999);

    my.oskill = data; // update skill

    redis.setPlayer(my);

    

}