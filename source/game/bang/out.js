
let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli.js');
let chat = require('./chat.js');
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
        if(rightMe) return socket.chipi("Bạn là bang chủ không thể rời bang hội");

        e.menber = e.menber.filter(e2=>e2.id != my.id);

        chat(socket,{value : `${my.name} đã rời khỏi bang hội`});

        e.chat = await redis.getChat(bang);
        e.xinvao = await redis.getListXin(bang);
        socket.sendPT(e,'banghoi');
        socket.leavePT(); 
        my.skin.bangID = -1;
        my.skin.bang = 0;
        socket.sendMap({
            id : my.id,
            skin : my.skin,
        },'skin_map');
        string.update(my);
        socket.sendCode('outbanghoi');
        redis.setPlayer(my);

        mysqli.query(`UPDATE banghoi SET menber = ? WHERE id = ?`,[JSON.stringify(e.menber),bang]);

    });

}