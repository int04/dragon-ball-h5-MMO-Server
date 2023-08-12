let string = require('../../Model/string.js');
let chat = require('./chat.js');
let mysqli = require('../../Model/mysqli.js');
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

        let rightMe = e.menber.find(e2=>e2.id == my.id && e2.right >= 1);
        if(!rightMe) return socket.chipi("Bạn không có quyền kick người này");

        let rightTo = e.menber.find(e2=>e2.id == data.id);
        if(!rightTo) return socket.chipi("Không tìm thấy người này trong bang hội");
        if(rightTo.right >= rightMe.right) return socket.chipi("Người này không thể kick");

        if(rightTo.id == rightMe.id) return socket.chipi("Bạn không thể kick chính mình");

        e.menber = e.menber.filter(e2=>e2.id != data.id);
        chat(socket,{value : `${rightTo.name} đã bị kick khỏi bang hội`});
        e.chat = await redis.getChatBang(bang);
        e.xinvao = await redis.getListXin(bang);
        socket.sendPT(e,'banghoi');
        socket.sendCode('phongphosuccess');

        mysqli.query(`UPDATE banghoi SET menber = ? WHERE id = ?`,[JSON.stringify(e.menber),bang]);

        let callback = async function(to) {
            to.skin.bangID = -1;
            to.skin.bang = 0;
            
            if(to.socket)
            {
                process.send({
                    since04: {
                        skin : to.skin,
                        type : 'banghoi',
                        uid : to.id,
                        action : 'set',
                    }
                });
                socket.sendTo(to.skin,to.id,'skin');
                socket.sendTo(bang,to.id,"roisocketbang");
                socket.sendMap({
                    id : to.id,
                    skin : to.skin,
                },'skin_map');
                string.update(to);
            }
            else 
            {
                mysqli.query(`UPDATE nhanvat SET skin = ? WHERE id = ?`,[JSON.stringify(to.skin),to.id]);
            }
            
        }

        let to = await redis.getPlayer(data.id);
        if(to) {
            callback(to);
        }
        else
        {
            mysqli.query("SELECT * FROM `nhanvat` WHERE `id` = ?",[data.id],function(err,rows) {
                if(rows.length <=0) return socket.chipi("Không tìm thấy nhân vật này");
                to = rows[0];
                to.skin = JSON.parse(to.skin);
                callback(to);
            });
        }



    });
}