
let string = require('../../Model/string.js');
let db = require('./db.js');
let checkMoi = function(id) 
{
    return new Promise( async (resolve,reject) => {
        let cache = await db.getPk();
        cache.pk.moi = cache.pk.moi.filter(e => e.time > Date.now());
        db.setPk(cache);
        let checked = cache.pk.moi.find(e => e.from == id || e.to == id);
        if(checked) return resolve(true);
        return resolve(false);

    });
}

let checkIn = function(id)
{
    return new Promise( async (resolve,reject) => {
        let cache = await db.getPk();
        cache.pk.in = cache.pk.in.filter(e => e.time > Date.now());
        db.setPk(cache);
        let checked = cache.pk.in.find(e => e.from == id || e.to == id);
        if(checked) return resolve(true);
        return resolve(false);

    });

}

let deleteMoi = function(id)
{
    return new Promise( async (resolve,reject) => {
        let cache = await db.getPk();
        cache.pk.moi = cache.pk.moi.filter(e => e.time > Date.now());
        cache.pk.moi.forEach((elment,index) => {
            if(elment.from == id || elment.to == id) cache.pk.moi.splice(index,1);
        }
        );
        db.setPk(cache);
    });

}

let moiPVP = async function(socket,data) 
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return false;
    if(my.info.chiso.hp <=0) return false;

    let id = data.id;
    if(!id) return false;

    let vang = string.int(data.vang);
    if(vang < 1000 || vang > 2000000000) return false;

    let to = await db.getPlayer(id);
    if(!to) return false;
    if(to.info.chiso.hp <=0) return false;

    if(await checkMoi(id)) return socket.chipi('Đối thủ đang có lời mời khác');

    if(await checkIn(id)) return socket.chipi('Đối thủ đang trong trận đấu');

    if(await checkIn(socket.uid)) return socket.chipi('Bạn đang trong trận đấu');

    if(await checkMoi(socket.uid)) return socket.chipi('Bạn đang có lời mời khác');

    if(my.tien.vang < vang) return socket.chipi('Bạn không đủ vàng');

    if(to.tien.vang < vang) return socket.chipi('Đối thủ không đủ vàng');

    let cache = await db.getPk();

    cache.pk.moi.push({
        from : socket.uid,
        to : id,
        time : Date.now() + 30000,
        vang : vang,
    });

    socket.chipi("Đã gửi lời mời."); 
    socket.sendTo({
        id : socket.uid,
        vang : vang,
    },id,'moipvp');

    db.setPk(cache);



}

let PVP_Yes = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return false;
    if(my.info.chiso.hp <=0) return false;

    let id = data.id;

    let cache = await db.getPk();

    let check = cache.pk.moi.find(e => e.from == id && e.to == socket.uid);
    if(!check) return false;

    let to = await db.getPlayer(id);
    if(!to) return false;
    if(to.info.chiso.hp <=0) return false;

    if(await checkIn(id)) return socket.chipi('Đối thủ đang trong trận đấu');

    if(await checkIn(socket.uid)) return socket.chipi('Bạn đang trong trận đấu');

    let vang = check.vang;
    if(my.tien.vang < vang) {
        socket.chipi('Bạn không có đủ tiền');
        socket.sendToChipi('Đối thủ không có đủ tiền',id);
        deleteMoi(id);
        return false;
    }
    if(to.tien.vang < vang) {
        socket.chipi('Đối thủ không có đủ tiền');
        socket.sendToChipi('Bạn không có đủ tiền',id);
        deleteMoi(id);
        return false;
    }

    if(to.pos.map != my.pos.map || to.pos.zone != my.pos.zone) {
        return deleteMoi(id);
    }        


    cache.pk.in.push({
        from : id,
        to : socket.uid, 
        vang : vang,
        map : my.pos.map,
        zone : my.pos.zone,
    });

    my.tien.vang -= vang;
    to.tien.vang -= vang;

    process.send({
        since04 : {
            type : 'player',
            object : 'vang',
            value : -vang,
            uid : to.id,
        }
    })

    socket.send(my.tien,'tien');

    db.setPlayer(my);

    await db.setPk(cache);


    socket.chipi('Trận đấu bắt đầu.');
    socket.sendToChipi('Trận đấu bắt đầu.',id);
    deleteMoi(id);

}

let PVP_No = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return false;
    if(my.info.chiso.hp <=0) return false;
    let id = data.id;
    let cache = await db.getPk();
    let check = cache.pk.moi.find(e => e.from == id && e.to == socket.uid);
    if(check) 
    {
        socket.sendToChipi('Đối thủ từ chối thách đấu.',id);
        deleteMoi(id);
    }
}

/* 
    pk : {
    moi : [],
    in : [],
*/

module.exports = function (socket, data) 
{
    if(socket.uid <=0) return false;
    if(typeof data != 'object') return false;
    if(data.type == 'send') return moiPVP(socket,data);
    if(data.type == 'yes') return PVP_Yes(socket,data);
    if(data.type == 'no') return PVP_No(socket,data);
}