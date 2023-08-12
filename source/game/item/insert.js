
let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');

let redis = require('../../Model/redis.js');

module.exports = function (socket,data) {

    if(socket.uid <=0) socket.sendCode(-999);
    
    let my = socket.my;

    if(!my) return console.log('Không tìm được người dùng.');
    let idvp = data; 
    if(!idvp) return console.log('Không đọc được iD'); 

    let infoItem = item.find(e=>e.id == idvp);
    if(!infoItem) return console.log('Không có item này');

    if(string.checkRuong(my) <=0) return socket.sendCode(1311);

 
    my.ruong.item.push({
        id : string.az(10),
        active : 'hanhtrang',
        info : infoItem.info,
        item : infoItem.id,
        soluong : 1, 
        khoa : 0,
        level : 0,
        sao : 0,
        saotrong : 0
    })  

    redis.setPlayer(my).then(()=>{
        socket.send({
            _i : string.rand(1,100),
            _1 : my.ruong, 
            _2 : my.trangbi,
        })
    });
    
 
}