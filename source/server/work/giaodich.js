
let getMy = require('./getMy');
let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');




module.exports = function(io,data) {
    let uid = data.uid;
    if(!uid) return console.log('Thiếu UID');
    let socket = getMy(io,uid);
    if(!socket) return false;
    if(socket.uid <=0) return console.log('UID không hợp lệ');
    let my = socket.my;
    
    my.tien = data.data.tien;
    my.ruong = data.data.ruong;

    redis.setPlayer(my);


    


}