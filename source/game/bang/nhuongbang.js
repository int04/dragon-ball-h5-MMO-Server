let chat = require('./chat.js');
let mysqli = require('../../Model/mysqli.js');
let string = require('../../Model/string.js');

let redis = require('./redis.js');

module.exports = function(socket,data)
{
    let my = socket.my;
    if(!my) return false;
    let bang = my.skin.bangID;
    if(!bang) return false;

    let sql = `SELECT * FROM banghoi WHERE id = ?`;
    mysqli.query(sql,[bang], async function(err,rows) {
        if(rows.length <=0) return socket.chipi("Không tìm thấy bang hội");
        let e = rows[0];
        e.info = JSON.parse(e.info);
        e.menber = JSON.parse(e.menber);

        let rightMe = e.menber.find(e2=>e2.id == my.id && e2.right >= 2);
        if(!rightMe) return socket.chipi("Bạn không phải bang chủ");

        let rightTo = e.menber.find(e2=>e2.id == data.id);
        if(!rightTo) return socket.chipi("Không tìm thấy người này trong bang hội");

        if(rightTo.right >= 2) return socket.chipi("Người này đã là bang chủ");

        rightTo.right = 2;
        rightMe.right = 0;
        chat(socket,{value : `${rightTo.name} đã được phong làm bang chủ`});
        e.chat = await redis.getChat(bang);
        e.xinvao = await redis.getListXin(bang);
        socket.sendPT(e,'banghoi');
        socket.sendCode('phongphosuccess');
        mysqli.query(`UPDATE banghoi SET menber = ? WHERE id = ?`,[JSON.stringify(e.menber),bang]);
        
    });
}