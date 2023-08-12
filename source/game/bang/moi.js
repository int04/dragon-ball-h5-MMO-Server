let mysqli = require('../../Model/mysqli.js');
let string = require('../../Model/string.js');

let redis = require('./redis.js');

let sendTo = async function(socket,data) {
    let my = socket.my;
    if(!my) return false;
    let id = data.id;

    let to = await redis.getPlayer(id);
    if(!to) return socket.chipi("Người chơi không online.");

    if(to.skin.bangID >=1) return socket.chipi("Người này đã có bang hội");

    let bang = my.skin.bangID;

    if(!bang) return socket.chipi("Bạn không có bang hội");

    let code = await redis.setPT_moi(bang,id);

    
    socket.chipi("Gửi lời mời thành công.");

    socket.sendTo({
        name : my.name,
        bang : bang
    },id,"moi_jo_PT");

}

let accept = function(socket,data) {
    let my = socket.my;
    if(!my) return false;
    let bang = data.bang;
    if(!bang) return socket.chipi("Không tìm thấy yêu cầu này");
    


    if(my.skin.bangID >=1) return socket.chipi("Bạn đã có bang hội rồi.");

    let sql = `SELECT * FROM banghoi WHERE id = ?`;
    mysqli.query(sql,[bang], async function(err,rows) {
        if(rows.length <=0) return socket.chipi("Không tìm thấy bang hội");
        let e = rows[0];
        e.info = JSON.parse(e.info);
        e.menber = JSON.parse(e.menber);
        if(e.menber.length >= e.info.max) return socket.chipi("Bang hội đã đủ người");

        my.skin.bangID = bang;
        my.skin.bang = e.info.icon;

        e.menber.push({
            id : my.id,
            time : Date.now(),
            right : 0,
            name : my.name,
            skin : my.skin,
            avatar : my.info.coban.avatar,
            sucmanh : my.info.coban.sucmanh,
            chodau : 0,
            nhandau : 0,
        });

        string.update(my);
        string.log(my.id,`Vào bang ${e.name}`);
        redis.setPlayer(my);

        // update bang
        mysqli.query(`UPDATE banghoi SET menber = ? WHERE id = ?`,[JSON.stringify(e.menber),bang]);

        socket.sendMap({
            id : my.id,
            skin : my.skin,
        },'skin_map');

        socket.joinPT();
        e.chat = await redis.getChatBang(bang);
        e.xinvao = await redis.getListXin(bang);
        socket.sendPT(e,'banghoi');

        socket.sendCode("gianhapbangsuccess")

        redis.deleteAllPTXinUsers(my.id);
        redis.deletePTMoiALLUID(my.id);


    });


    
}

let not_accept = function(socket,data) {
    let my = socket.my;
    if(!my) return false;
    let bang = data.bang;
    if(!bang) return socket.chipi("Không tìm thấy yêu cầu này");
    
    redis.deleteMoi(bang,my.id).then(result=>{
        console.log('delete moi',result);
    });

    socket.chipi("Đã từ chối lời mời vào bang hội");

}

module.exports = function(socket,data)
{
    PTmoi = PTmoi.filter(e=>e.time + 360000 > Date.now());
    if(data.action == 'send') 
    {
        return sendTo(socket,data);
    }
    if(data.action == 'accept') return accept(socket,data);
    if(data.action == 'not_accept') return not_accept(socket,data);
}