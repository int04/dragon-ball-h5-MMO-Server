let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');
module.exports = function (socket, data) {
   if (socket.uid <= 0) return false;

   let my = player.find(e => e.id == socket.uid);

      redis.getPlayer(socket.uid).then(my => {
         if (my) {
            my.info.act = data;
            socket._sendMap({
                _k: string.rand(1, 100),
                _1: my.id,
                _2: my.info.act,
            })
    
            if (my.detu && my.detu.id) {
                let detu = my.detu;
                let change = 0;
                if (detu.info.trangthai == 'ditheo') {
                    if (my.info.act == 'dungyen') {
                        detu.info.act = 'dungyen';
                        change = 1;
                    }
                    if (my.info.act == 'fly') {
                        detu.info.act = 'fly';
                        change = 1;
                    }
                    if (my.info.act = 'baylen') {
                        detu.info.act = 'baylen';
                        change = 1;
                    }
                    if (change == 1) {
                        socket.sendMap({
                            _k: string.rand(1, 100),
                            _1: detu.id,
                            _2: detu.info.act,
                        })
                    }
                }
            }

            redis.setPlayer(my);
    
        } else {
            socket.sendCode(-999);
        }
      });


}
