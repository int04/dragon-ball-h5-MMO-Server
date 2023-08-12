let mysqli = require('../../Model/mysqli.js');
let string = require('../../Model/string.js');
const redis = require('./redis.js');


module.exports = async function(socket,data) 
{
    let my = socket.my;
    if(!my) return false;
    let bang = my.skin.bangID;
    if(!bang) return false;
    let sql = `SELECT * FROM banghoi WHERE id = ?`;
    mysqli.query(sql,[bang], async function(err,rows) {
        if(rows.length <=0) {
            socket.leavePT();
            my.skin.bangID = -1;
            my.skin.bang = 0;
            socket.send(my.skin,'skin');
            string.update(my);
            redis.setPlayer(my);
        }
        else 
        {
            let e = rows[0];
            e.info = JSON.parse(e.info);
            e.menber = JSON.parse(e.menber);
            e.info.name = e.name;
            e.info.timeVI = string.coverTime(e.info.time);
            e.menber.forEach(e2=>{
                e2.timeVI = string.coverTime(e2.time);
            }
            );
            let rightMe = e.menber.find(e2=>e2.id == my.id);
            if(rightMe) {
                socket.PTRight = rightMe.right;
            } 
                
            socket.sendMap({
                id : my.id,
                skin : my.skin,
            },'skin_map');
            e.chat = await redis.getChat(bang);
            e.xinvao = await redis.getListXin(bang);
            socket.joinPT();
            socket.send(e,'banghoi');

        }
    });
}