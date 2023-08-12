
let thoat = require('../../game/login/thoat.js');
let getMy = require('./getMy');
module.exports = function(io,data) {

    let uid = data.uid;
    if(!uid) return console.log('Thiếu UID');
    let socket = getMy(io,uid);
    if(!socket) return false;
    if(socket.uid <=0) return console.log('UID không hợp lệ');
    let my = socket.my;
    if(!my) return console.log('Không tìm thấy my');

    socket.sendCode("dis");
    thoat(socket)


}