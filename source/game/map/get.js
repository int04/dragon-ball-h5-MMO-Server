

let vao = require('../../Model/base/vao');
let npc = require('../../Model/base/npc');

let redis = require('../../Model/redis.js');

module.exports = function (socket) {

    if (socket.uid >= 1) {

        let player = redis.playerInZone(socket.map, socket.zone,socket.uid);
        let vatphamZone = redis.itemInZone(socket.map, socket.zone);
        let mobListZone = redis.mobInZone(socket.map, socket.zone);
        let vaoZone = vao.filter(e => e.map == socket.map );
        let listNPC = npc.filter(e => e.map.map == socket.map);
        let bossListZone = redis.bossInZone(socket.map, socket.zone);



        Promise.all([player, vatphamZone,mobListZone,bossListZone]).then(data => {
            socket.send({
                _1: data[0],
                _2: data[2],
                _3: data[1],
                _4 : vaoZone,
                _5 : listNPC,
                _b : true,
                _6 : data[3],
            });
        });

        /*
        let playerListZone = player.filter(e => e.pos.map == socket.map && e.pos.zone == socket.zone && e.id != socket.uid);
        let mobListZone = mob.filter(e => e.pos.map == socket.map && e.pos.zone == socket.zone && e.info.chiso.hp > 0);
        let vatphamZone = vatpham.filter(e => e.pos.map == socket.map && e.pos.zone == socket.zone);
        let listBOSS = BOSS.filter(e => e.pos.map == socket.map && e.pos.zone == socket.zone);

        socket.send({
            _1: playerListZone, 
            _2: mobListZone,
            _3: vatphamZone,
            _4 : vaoZone,
            _5 : listNPC,
            _b : true,
            _6 : listBOSS,
        });
        */
    }
    else 
    {
        socket.sendCode(-999);
    }

}