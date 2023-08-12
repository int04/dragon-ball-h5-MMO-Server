let string = require('../../Model/string.js');
let deleteLog = require('./delete.js');
let redis = require('../../Model/redis.js');
module.exports = async function(socket) 
{
    if(socket.uid > 0)
    {
        let playerID = socket.my;
        string.log(socket.uid,'Outgame')
        socket.leave("game");
        string.update(playerID);
        socket.leaveMap();
        socket.leavePT();
        socket.sendMap(socket.uid,-86);
        delete socket.map;
        delete socket.zone;
        if(playerID.detu && playerID.detu.id) 
        {
            redis.getPlayer(playerID.detu.id).then(data => {
                if(data) 
                {
                    redis.delPlayer(playerID.detu.id);
                }
            });

        }

        deleteLog(socket.uid);
        redis.delPlayer(socket.uid).then(e => {
        })
        socket.uid = 0;
        socket.my = {};

        
    }
}