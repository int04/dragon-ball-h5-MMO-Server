
let getMy = require('./getMy');
let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');

let playerDie = require('./playerDie.js');

let truKI = function(socket,ki) 
{
    let my = socket.my;
    my.info.chiso.ki -= ki;
    if(my.info.chiso.ki < 0) my.info.chiso.ki = 0;
    redis.setPlayer(my);

    socket.sendMap({
        _1 : null,
        _2 : my.id,
        _3 : ki, 
        _4 : 'truki',
        _5 : {
            
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });

}


let congKi = function(socket,ki)
{
    let my = socket.my;
    my.info.chiso.ki += ki;
    if(my.info.chiso.ki > my.info.chiso.kiFull) my.info.chiso.ki = my.info.chiso.kiFull;
    redis.setPlayer(my);

    socket.sendMap({
        _1 : null,
        _2 : my.id,
        _3 : ki, 
        _4 : 'congki',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });
}

let congHp = function(socket,hp)
{
    let my = socket.my;
    my.info.chiso.hp += hp;
    if(my.info.chiso.hp > my.info.chiso.hpFull) my.info.chiso.hp = my.info.chiso.hpFull;
    redis.setPlayer(my);

    socket.sendMap({
        _1 : null,
        _2 : my.id,
        _3 : hp, 
        _4 : 'conghp',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });
}

let truHp = function(socket,hp,killer = null)
{
    let my = socket.my;

    if(my.info.chiso.hp >= 1 && my.info.chiso.hp - hp <= 0) {
        playerDie(socket,killer,'player');
    }

    my.info.chiso.hp -= hp;
    if(my.info.chiso.hp < 0) my.info.chiso.hp = 0;
    redis.setPlayer(my);

    socket.sendMap({
        _1 : null,
        _2 : my.id,
        _3 : hp, 
        _4 : 'truhp',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });
}

let congExp = function(socket,exp) {
    let my = socket.my;
    my.info.coban.sucmanh+= exp;
    my.info.coban.tiemnang+= exp;
    my.info.coban.tiemnangFull+= exp;

    if(my.nhiemvu && my.nhiemvu.data && my.nhiemvu.data.type && my.nhiemvu.data.type  == 'up') {
		my.nhiemvu.data.have = my.info.coban.sucmanh;
        if(my.nhiemvu.data.have >= my.nhiemvu.data.need) {
            socket.chipi("Bạn đã đủ sức mạnh, đi làm nhiệm vụ thôi nào !");
        }

        my = string.info(my);
        socket.send(my.nhiemvu,"updatedQuest")
	}

    redis.setPlayer(my);

    socket.sendMap({
        _1 : my.id,
        _2 : my.id,
        _3 : exp, 
        _4 : 'congexp',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });
}


let updateVang = function(socket,value) {
    let my = socket.my;
    console.log('Update tiền vàng trước',string.number_format(my.tien.vang))
    my.tien.vang+= value;
    console.log('Update tiền vàng sau',string.number_format(my.tien.vang))
    socket.send(my.tien,'tien');
    redis.setPlayer(my);
}

let updateZeni = function(socket,value) {
    let my = socket.my;
    my.tien.zeni+= value;
    socket.send(my.tien,'tien');
    redis.setPlayer(my);
}

module.exports = function(io,data) {
    let uid = data.uid;
    if(!uid) return console.log('Thiếu UID');
    let socket = getMy(io,uid);
    if(!socket) return false;
    if(socket.uid <=0) return console.log('UID không hợp lệ');
    let my = socket.my;
    if(!my) return console.log('Không tìm thấy my');

    console.log(data)

    if(data.object == 'truKi') return truKI(socket,data.value);
    if(data.object == 'congKi') return congKi(socket,data.value);
    if(data.object == 'congHp') return congHp(socket,data.value);
    if(data.object == 'truHp') return truHp(socket,data.value, data.killer);
    if(data.object == 'congExp') return congExp(socket,data.value);
    if(data.object == 'vang') return updateVang(socket,data.value);
    if(data.object == 'zeni') return updateZeni(socket,data.value);


}