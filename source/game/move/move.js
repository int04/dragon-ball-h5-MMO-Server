let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');
module.exports = function (socket, data) {
    if (socket.uid <= 0) return false;

    if (typeof data != 'object') return false;

    let x = data._1 >> 0 || 0;
    let y = data._2 >> 0 || 0;
    let move = data._3 || 1;
    let act = data._4 || 'dungyen';
    move = move == 1 ? 'right' : 'left';
    

    let my = socket.my;

    if (my) {

        my.eff = string.eff(my.eff);

        let choang = string.choang();
        let bichoang = 0;
        choang.forEach(element => {
            if (my.eff[element] && my.eff[element].active == true) bichoang = 1;
        });
        if (bichoang == 1) return string.bug('không thể thực hiện');

        my.pos.x = x;
        my.pos.y = y;
        my.info.move = move;
        my.info.act = act;
        socket._sendMap({
            _1: my.id,
            _2: my.pos.x,
            _3: my.pos.y,
            _4: data._3,
            _5: act,
            _a: 1,
        });
        if (my.detu && my.detu.id && my.detu.info && my.detu.info.trangthai && my.detu.info.trangthai != 'venha') {
            let detu = player.find(e => e.id == my.detu.id);
            if (!detu) {
                detu = my.detu;
                detu.of = my.id;
                detu.type = 'player';
                player.push(detu);
            }


            if (detu && detu.id && detu.info.chiso.hp >= 1 && (detu.info.trangthai == 'ditheo' || detu.info.trangthai == 'baove')) {
                x += move == 'right' ? -50 : 50;
                detu.pos.map = my.pos.map;
                detu.pos.zone = my.pos.zone;
                detu.pos.x = x;
                detu.pos.y = y;
                detu.info.move = move;
                detu.info.act = act;
                if (my.info.act == 'fly') detu.info.act = 'fly';
                if (my.info.act == 'baylen') detu.info.act = 'baylen';
                socket.sendMap({
                    _1: detu.id,
                    _2: detu.pos.x,
                    _3: detu.pos.y,
                    _4: data._3,
                    _5: detu.info.act,
                    _a: 1,
                });
            }
        }
        redis.setPlayer(my.id, my);
    } else {
        socket.sendCode(-999);
    }
    

}
