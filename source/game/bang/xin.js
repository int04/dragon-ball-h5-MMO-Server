
let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli.js');
let redis = require('./redis.js');
module.exports = async function(socket,data)
{
    let my = socket.my;
    let id = data.id;
    if(!id) return socket.chipi("Không tìm thấy bang hội");
    if(!my) return false;

    let bang = my.skin.bangID;
    if(bang >=1) return socket.chipi("Bạn đã có bang hội rồi");



    let action = await redis.setPTxin(id,my.id,{
        name : my.name,
        time : Date.now(),
        avatar : my.info.coban.avatar,
        sucmanh : my.info.coban.sucmanh,
        skin : my.skin,
        uid : my.id,
        bang : id,
    });
    if(!action) return socket.chipi("Gửi yêu cầu vào bang thất bại");


    let list = await redis.getListXin(id);

    socket.to("BANG_"+id).emit("bangxin",list); 
 
    socket.chipi("Gửi yêu cầu vào bang thành công, vui lòng chờ bang chủ đồng ý nhé");






}