
let getMy = require('./getMy');
let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');

let tdhs = function(socket,time) 
{
    let my = socket.my;
    my.eff = string.eff(my.eff);

    my.eff.thaiduonghasan = my.eff.thaiduonghasan || {};
    my.eff.thaiduonghasan.time = Date.now() + time * 1000;
    my.eff.thaiduonghasan.active = true;
    redis.setPlayer(my);

    let txt = ["Mù mắt rồi.","Mắt của ta"];
    socket.sendMap({
        _1 : my.id,
        _2 : txt[string.rand(0,txt.length - 1)],
        _h : string.rand(1,100),
        eff : [
            {
                id : my.id,
                eff : my.eff,
            }
        ]
    }
    )

}

let rungu = function(socket,time)
{
    let my = socket.my;
    my.eff = string.eff(my.eff);

    my.eff.rungu = my.eff.rungu || {};
    my.eff.rungu.time = Date.now() + time * 1000;
    my.eff.rungu.active = true;
    redis.setPlayer(my);

    let txt = ["Nhạc hay quá"];
    socket.sendMap({
        _1 : my.id,
        _2 : txt[string.rand(0,txt.length - 1)],
        _h : string.rand(1,100),
        eff : [
            {
                id : my.id,
                eff : my.eff,
            }
        ]
    }
    )
}


module.exports = function(io,data) {
    let uid = data.uid;
    if(!uid) return console.log('Thiếu UID');
    let socket = getMy(io,uid);
    if(!socket) return false;
    if(socket.uid <=0) return console.log('UID không hợp lệ');
    let my = socket.my;
    if(!my) return console.log('Không tìm thấy my');

    if(data.name == 'tdhs') return tdhs(socket,data.time);
    if(data.name == 'rungu') return rungu(socket,data.time);



    


}