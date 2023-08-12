let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli.js');

let redis = require('./redis.js');

module.exports = async function(socket,data) 
{
    let my = socket.my;
    if(!my) return false;
    let agree = data.agree;
    let uid = data.id;

    if(!uid) return socket.chipi("Không tìm thấy yêu cầu này");

    let bang = my.skin.bangID;
    if(!bang) return socket.chipi("Bạn không có bang hội");

    let xin = await redis.ptXin(bang,uid);
    if(!xin) return socket.chipi("Không tìm thấy yêu cầu này");

    if(agree == false) 
    {
        await redis.deletePTxin(bang,uid);

        let list = await redis.getListXin(bang);

        

        return socket.chipi("Đã từ chối yêu cầu vào bang hội");
    }

    let sql = `SELECT * FROM banghoi WHERE id = ?`;
    mysqli.query(sql,[bang], async function(err,rows) {
        if(rows.length <=0) {
            socket.chipi("Không tìm thấy bang hội");
        }
        else
        {
            redis.deletePTxin(bang,uid);

            let e = rows[0];
            e.info = JSON.parse(e.info);
            e.menber = JSON.parse(e.menber);

            let rightMe = e.menber.find(e2=>e2.id == my.id && e2.right >= 1);
            if(!rightMe) return socket.chipi("Bạn không có quyền duyệt yêu cầu vào bang hội");

            // check menber
            if(e.menber.length >= e.info.max) return socket.chipi("Bang hội đã đủ người");

            let callback = async function(to) {
                if(to.skin.bangID >=1) return socket.chipi("Người này đã có bang hội");
                to.skin.bangID = bang;
                to.skin.bang = e.info.icon;
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
                e.menber.push({
                    id : to.id,
                    time : Date.now(),
                    right : 0,
                    name : to.name,
                    skin : to.skin,
                    avatar : to.info.coban.avatar, 
                    sucmanh : to.info.coban.sucmanh,
                    chodau : 0,
                    nhandau : 0,
                });
                mysqli.query(`UPDATE banghoi SET menber = '${JSON.stringify(e.menber)}' WHERE id = '${bang}'`);
                e.chat = await redis.getChatBang(bang);
                e.xinvao = await redis.getListXin(bang);
                socket.sendPT(e,'banghoi');
                socket.send({},"openduyetmen");
            }

            // check player
            let to = await redis.getPlayer(uid);
            if(!to) {
                // offline
                mysqli.query("SELECT * FROM `nhanvat` WHERE `id` = ?",[uid],function(err,rows) {
                    if(rows.length <=0) return socket.chipi("Không tìm thấy nhân vật này");
                    to = rows[0];
                    
                    to.skin = JSON.parse(to.skin);
                    to.info = JSON.parse(to.info);
                    callback(to);
                });


            }
            else 
            {
                // online
                callback(to);
            }

            
        }
    });


    



}