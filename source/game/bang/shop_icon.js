let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli.js');
let icon = require('./icon.js');

let redis = require('./redis.js');

module.exports = function(socket,data)
{
    let iconID = data.iconID;
    if(!iconID) return false;
    let iconData = icon.find(e=>e.id == iconID);
    if(!iconData) return socket.noti('Không tồn tại biểu tượng này.');

    let my = socket.my;
    if(!my) return socket.noti("Không tìm thấy nhân vật.");

    let bang = my.skin.bangID;
    if(!bang) return socket.noti("Bạn không có bang hội");

    if(my.tien[iconData.type == 1 ?'vang' : 'zeni'] < iconData.cost) return socket.chipi('Không đủ tiền để thực hiện.');

    let sql = `SELECT * FROM banghoi WHERE id = ?`;

    mysqli.query(sql,[bang], async function(err,rows) {
        if(rows.length <=0) return socket.chipi("Không tìm thấy bang hội");
        let e = rows[0];
        e.info = JSON.parse(e.info);
        e.menber = JSON.parse(e.menber);

        let rightMe = e.menber.find(e2=>e2.id == my.id && e2.right >= 2);
        if(!rightMe) return socket.chipi("Tính năng chỉ dành riêng cho chủ bang hội");

        my.tien[iconData.type == 1 ?'vang' : 'zeni'] -= iconData.cost;
        socket.send(my.tien,'tien');
        socket.send(my.skin,'skin');

        e.info.icon = iconID;

        string.log(socket.uid,`tien_${iconData.cost}_${iconData.type == 1 ? 'vang' : 'zeni'}_shopIconPT_${iconData.name} `)
        Promise.all(e.menber.map(e2=>{

            return new Promise(async (resolve,reject)=>{

                // nếu user online
                let to = await redis.getPlayer(e2.id);
                if(to) {
                    to.skin.bang = iconID;
                    to.skin.bangID = bang;
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
                        socket.sendMap({
                            id : to.id,
                            skin : to.skin,
                        },'skin_map');
                        string.update(to);
                    }
                    e2.skin = to.skin;
                    e2.sucmanh = to.info.coban.sucmanh;
                    // save object
                    Object.assign(e.menber.find(e3=>e3.id == e2.id),e2);
                    resolve(true)
                }
                else 
                {
                    // user offline
                    mysqli.query("SELECT * FROM `nhanvat` WHERE `id` = ?",[e2.id],function(err,rows) {
                        if(rows.length <=0) resolve(true);
                        to = rows[0];
                        to.skin = JSON.parse(to.skin);
                        to.info = JSON.parse(to.info);
                        to.skin.bang = iconID;
                        to.skin.bangID = bang;
                        // cập nhật lại skin
                        e2.skin = to.skin;
                        e2.sucmanh = to.info.coban.sucmanh;
                        // save object
                        Object.assign(e.menber.find(e3=>e3.id == e2.id),e2);
                        mysqli.query(`UPDATE nhanvat SET skin = ? WHERE id = ?`,[JSON.stringify(to.skin),to.id]);
                        resolve(true)
                    });
                }

            });

        })).then( async (men)=>{
            mysqli.query(`UPDATE banghoi SET info = ?, menber = ? WHERE id = ?`, [JSON.stringify(e.info),JSON.stringify(e.menber),bang]);
            e.chat = await redis.getChatBang(bang);
            e.xinvao = await redis.getListXin(bang);
            socket.sendPT(e,'banghoi');
            socket.sendCode('outbanghoi');
        });

    });
}