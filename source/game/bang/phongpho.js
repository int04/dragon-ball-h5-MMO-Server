let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli.js');
let chat = require('./chat.js');
let redis = require('./redis.js'); 
module.exports =  async function(socket,data) 
{
    let id = data.id;
    if(!id) return false;
    let my = socket.my;
    if(!my) return false;
    let bang = my.skin.bangID;
    if(!bang) return false;

    let sql = `SELECT * FROM banghoi WHERE id = ?`;
    mysqli.query(sql,[bang],async function(err,rows) {
        if(rows.length <=0) return socket.chipi("Không tìm thấy bang hội");
        let e = rows[0];
        e.info = JSON.parse(e.info);
        e.menber = JSON.parse(e.menber);
        let rightMe = e.menber.find(e2=>e2.id == my.id && e2.right >= 1);
        if(!rightMe) return socket.chipi("Bạn không có quyền phong phó bang cho người này");

        let rightTo = e.menber.find(e2=>e2.id == id);
        if(!rightTo) return socket.chipi("Không tìm thấy người này trong bang hội");

        if(rightTo.right >= 1) return socket.chipi("Người này đã là phó bang");

        rightTo.right = 1;

        chat(socket,{value : `${rightTo.name} đã được phong làm phó bang`});

        e.chat = await redis.getChatBang(bang);
        e.xinvao = await redis.getListXin(bang);
        socket.sendPT(e,'banghoi');

        mysqli.query(`UPDATE banghoi SET menber = ? WHERE id = ?`,[JSON.stringify(e.menber),bang]);


        socket.sendCode('phongphosuccess');




    });
}