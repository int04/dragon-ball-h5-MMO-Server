
let string =  require("../../Model/string.js");
let item = require("../../Model/base/item.js");
let db = require("./giaodich.js");

let moigiaoDich = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return string.bug("Không tìm thấy người chơi");

    let giaodich = await db.getGiaodich();
    console.log('hiiii')


    giaodich.moi = giaodich.moi.filter(e=>e.time > Date.now());

    let to = data._2;
    if(!to) return false;


    let target = await db.getPlayer(to);

    if(!target) return string.bug("Không tìm thấy người chơi");

    if(target.of) return socket.noti("bạn không thể giao dịch với người chơi này");

    /* Kiểm tra xem có cùng bản đồ không */

    if(my.pos.map != target.pos.map || my.pos.zone != target.pos.zone) return socket.noti("Người chơi không cùng bản đồ với bạn.");

    /* kiểm tra xem người chơi có đang mời ai không */

    let moi = giaodich.moi; 

    /* Nếu người chơi đang mời hoặc nhận giao dịch từ người khác */

    if(moi.find(e=>e.from == socket.uid || e.to == socket.uid)) return socket.noti("Bạn đang có lời mời giao dịch với người khác, xin chờ.");

    /* Nếu đối phương đang có lời mời với giao dịch khác */

    if(moi.find(e=>e.from == to || e.to == to)) return socket.noti("Người chơi đang có lời mời giao dịch với người khác, xin chờ.");

    /* nếu người chơi đang giao dịch với người chơi khác */

    let dang = giaodich.dang;

    if(dang.find(e=>e.from == socket.uid || e.to == socket.uid)) return socket.noti("Bạn đang trong trạng thái giao dịch với người chơi khác, xin vui lòng chờ.");

    /* nếu đối phương đang giao dịch với người chơi khác */

    if(dang.find(e=>e.from == to || e.to == to)) return socket.noti("Người chơi đang trong trạng thái giao dịch với người khác, xin vui lòng chờ.");

    /* Tiến hành insert giao dịch */

    giaodich.moi.push({
        from : socket.uid,
        to : to,
        time : Date.now() + 60000,
    })

    await db.setGiaodich(giaodich);

    socket.noti("Gửi lời mời thành công, xin vui lòng chờ đối phương đồng ý");

    socket.sendTo(socket.uid,to,"moigiaodich");



}

let khongChapNhan = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return string.bug("Không tìm thấy người chơi");
    let giaodich = await db.getGiaodich();

    let moi = giaodich.moi.find(e=>e.to == socket.uid);
    if(!moi) return string.bug("Không tìm thấy lời mời giao dịch nào để hủy");

    giaodich.moi = giaodich.moi.filter(e=>e.to != socket.uid);

    let target = await db.getPlayer(moi.from);
    if(target){
        socket.sendToChipi("Đối phương đã từ chối lời mời giao dịch của bạn",target.id);
    }
    giaodich.moi = giaodich.moi.filter(e=>e.to != socket.uid);
    await db.setGiaodich(giaodich);

}

let chapNhan = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return string.bug("Không tìm thấy người chơi");
    let giaodich = await db.getGiaodich();
    let moi = giaodich.moi.find(e=>e.to == socket.uid);
    if(!moi) return string.bug("Không tìm thấy lời mời để chấp nhận");

    let target = await db.getPlayer(moi.from);
    if(!target) return string.bug("Không tìm thấy người chơi");

    /* Kiểm tra xem có cùng bản đồ không */

    if(my.pos.map != target.pos.map || my.pos.zone != target.pos.zone) return socket.noti("Người chơi không cùng bản đồ với bạn.");

    let dang = giaodich.dang;

    if(dang.find(e=>e.from == socket.uid || e.to == socket.uid)) return socket.noti("Bạn đang trong trạng thái giao dịch với người chơi khác, xin vui lòng chờ.");

    /* nếu đối phương đang giao dịch với người chơi khác */

    if(dang.find(e=>e.from == to || e.to == to)) return socket.noti("Người chơi đang trong trạng thái giao dịch với người khác, xin vui lòng chờ.");

    /* Tiến hành insert giao dịch */

    giaodich.dang.push({
        from : socket.uid,
        to : moi.from,
        vang : 0,
        item : [],
        khoa : 0,
        xong : 0,
    });

    giaodich.dang.push({
        to : socket.uid,
        from : moi.from,
        vang : 0,
        item : [],
        khoa : 0,
        xong : 0,
    });
    socket.sendTo(moi.to,moi.from,"chapnhangiaodich");
    socket.sendTo(moi.from,moi.to,"chapnhangiaodich");
    giaodich.moi = giaodich.moi.filter(e=>e.to != socket.uid);

    await db.setGiaodich(giaodich);

} 

let khoaGiaoDich =async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return string.bug("Không tìm thấy người chơi");

    let vang = data._2 >> 0;
    let item = data._3;

    if(typeof item != "object") return socket.noti("Danh sách vật phẩm không hợp lệ, không thể khóa.");

    let giaodich = await db.getGiaodich();

    let dang_my = giaodich.dang.find(e=>e.from == socket.uid);
    if(!dang_my) return string.bug("Bạn đang không giao dịch với ai hết.");

    if(dang_my.khoa !=0) return socket.noti("Bạn đã khóa giao dịch rồi.");


    let dang_target = giaodich.dang.find(e=>e.from == dang_my.to);
    if(!dang_target) return string.bug("Không thể tìm thấy đối phương giao dịch.");

    if(my.tien.vang < vang) return socket.noti("Bạn không có đủ vàng để giao dịch.");
    if(vang < 0 || vang > 500000000) return socket.noti("Số vàng tối đa từ 0 - 500.000.000 vàng.");


    dang_my.vang = vang;
    dang_my.item = item;
    dang_my.khoa = 1;

    socket.send(1,"khoagiaodichthanhcong");

    socket.sendTo({
        vang : vang,
        item : item,
    },dang_my.to,"nhangiaodichkhoa");

    await db.setGiaodich(giaodich);


}

let xongGiaoDich =async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return string.bug("Không tìm thấy người chơi");
    let giaodich = await db.getGiaodich();
    let dang_my = giaodich.dang.find(e=>e.from == socket.uid);
    if(!dang_my) return string.bug("Bạn đang không giao dịch với ai hết.");

    if(dang_my.khoa !=1) return socket.noti("Bạn chưa khóa giao dịch.");
    if(dang_my.xong !=0) return socket.noti("Bạn đã xác nhận hoàn tất giao dịch, vui lòng chờ đối phương nhé.");

    let dang_target = giaodich.dang.find(e=>e.from == dang_my.to);
    if(!dang_target) return string.bug("Không thể tìm thấy đối phương giao dịch.");

    if(dang_target.khoa !=1) return socket.noti("Đối phương chưa khóa giao dịch");


    if(dang_my.xong == 0 && dang_target.xong == 1) 
    {
        // thực hiện các thay đổi giao dịch, vì cả 2 đã hoàn tất giao dịch
        console.log('Tiến hành giao dịch')

        let player1 = my;
        let player2 = await db.getPlayer(dang_my.to);
        if(!player2) {
            socket.noti("Giao dịch bị hủy do đối phương không online.");
            return closeBox(socket);
        }

        // kiểm tra vàng player1
        if(player1.tien.vang < dang_my.vang) {
            socket.noti("Giao dịch thất bại do bạn không đủ vàng.");
            socket.sendToNoti("Giao dịch thất bại do đối phương không đủ vàng.",player2.id);
            return closeBox(socket);
        }

        // kiểm tra vàng player2
        if(player2.tien.vang < dang_target.vang) {
            socket.noti("Giao dịch thất bại do đối phương không đủ vàng.");
            socket.sendToNoti("Giao dịch thất bại do bạn không đủ vàng.",player2.id);
            return closeBox(socket);
        }

        // kiểm tra item player1
        let player1_ListItem = dang_my.item; 

        let player2_slot_have = player2.ruong.item.filter(e => e.active == 'hanhtrang').length;
        let player2_slot_max = player2.ruong.slot;
        let player2_slot_free = player2_slot_max - player2_slot_have;
        for (let i = 0; i < player1_ListItem.length; i++) {
            let e = player1_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            let myItem = player1.ruong.item.find(e2=>e2.id == e.id);
            if(!infoItem)
            {
                console.log(e)
                socket.noti("Giao dịch thất bại do không thể lấy thông tin VP được.");
                socket.sendToNoti("Giao dịch thất bại do không thể lấy thông tin VP được.",player2.id);
                return closeBox(socket);
            }
            if(!myItem) {
                socket.noti("Giao dịch thất bại do bạn không có đủ vật phẩm: "+infoItem.name+" .");
                socket.sendToNoti("Giao dịch thất bại do đối phương không có đủ vật phẩm: : "+infoItem.name+"",player2.id);
                return closeBox(socket);
            }
            if(myItem.soluong < e.soluong) {
                socket.noti("Giao dịch thất bại do bạn không có đủ vật phẩm: "+infoItem.name+" x "+e.soluong+" ("+myItem.soluong+") .");
                socket.sendToNoti("Giao dịch thất bại do đối phương không có đủ vật phẩm: : "+infoItem.name+" x "+e.soluong+" ("+myItem.soluong+")",player2.id);
                return closeBox(socket);
            }

            // kiểm tra luôn player2 có đủ chỗ trống không
            if(infoItem.type == 'trangbi') 
            {
                if(player2_slot_free < 1) {
                    socket.noti("Giao dịch thất bại do đối phương không có đủ chỗ trống để nhận "+infoItem.name+" .");
                    socket.sendToNoti("Giao dịch thất bại do bạn không có đủ chỗ trống để nhận "+infoItem.name+"  ",player2.id);
                    return closeBox(socket);
                }
                player2_slot_free--;
            }
            
            if(infoItem.type == 'item')
            {
                // kiểm tra xem người chơi đã có vật phẩm này chưa
                let playerItem = player2.ruong.item.find(e2=>e2.item == e.item && e2.active == 'hanhtrang');
                if(playerItem) {
                    if(infoItem.max && infoItem.max > 0 && playerItem.soluong+e.soluong > infoItem.max) {
                        socket.noti("Giao dịch thất bại do đối phương đã có tối đa "+infoItem.name+" không thể nhận thêm "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do bạn đa mang tối đa "+infoItem.name+"  không thể nhận thêm "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                    else 
                    if(playerItem.soluong+e.soluong >= 99) {
                        socket.noti("Giao dịch thất bại do đối phương đã có tối đa x99 "+infoItem.name+" không thể nhận thêm "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do bạn đa mang tối đa x99 "+infoItem.name+"  không thể nhận thêm "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                }
                else 
                {
                    if(player2_slot_free < 1) {
                        socket.noti("Giao dịch thất bại do đối phương không có đủ chỗ trống để nhận "+infoItem.name+" x "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do bạn không có đủ chỗ trống để nhận "+infoItem.name+"  x "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                    player2_slot_free--;
                }
            }

        }

        // kiểm tra item player2

        let player2_ListItem = dang_target.item;

        let player1_slot_have = player1.ruong.item.filter(e => e.active == 'hanhtrang').length;
        let player1_slot_max = player1.ruong.slot;
        let player1_slot_free = player1_slot_max - player1_slot_have;
        for (let i = 0; i < player2_ListItem.length; i++) {
            let e = player2_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            if(!infoItem)
            {
                socket.noti("Giao dịch thất bại do không thể lấy thông tin VP được.");
                socket.sendToNoti("Giao dịch thất bại do không thể lấy thông tin VP được.",player2.id);
                return closeBox(socket);
            }
            let myItem = player2.ruong.item.find(e2=>e2.id == e.id);
            if(!myItem) {
                socket.noti("Giao dịch thất bại do đối phương không có vật phẩm: "+infoItem.name+" .");
                socket.sendToNoti("Giao dịch thất bại do bạn không có đủ vật phẩm: "+infoItem.name+"",player2.id);
                return closeBox(socket);
            }
            if(myItem.soluong < e.soluong && infoItem.type !="trangbi") {
                socket.noti("Giao dịch thất bại do đối phương không có đủ số lượng: "+infoItem.name+" x "+e.soluong+" ("+myItem.soluong+") .");
                socket.sendToNoti("Giao dịch thất bại do bạn khnogo có đủ vật phẩm:  "+infoItem.name+" x "+e.soluong+" ("+myItem.soluong+")",player2.id);
                return closeBox(socket);
            }

            if(infoItem.type == 'trangbi') 
            {
                if(player1_slot_free < 1) {
                    socket.noti("Giao dịch thất bại do bạn không đủ chỗ trống để nhận "+infoItem.name+" .");
                    socket.sendToNoti("Giao dịch thất bại do đối phương không đủ chỗ trống để nhận "+infoItem.name+"  ",player2.id);
                    return closeBox(socket);
                }
                player1_slot_free--;
            }

            if(infoItem.type == 'item')
            {
                // kiểm tra xem người chơi đã có vật phẩm này chưa
                let playerItem = player1.ruong.item.find(e2=>e2.item == e.item && e2.active == 'hanhtrang');
                if(playerItem) {
                    if(infoItem.max && infoItem.max > 0 && playerItem.soluong+e.soluong > infoItem.max) {
                        socket.noti("Giao dịch thất bại do bạn đã đã có tối đa "+infoItem.name+" không thể nhận thêm "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do đối phương đã có tối đa "+infoItem.name+"  không thể nhận thêm "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                    else 
                    if(playerItem.soluong+e.soluong >= 99) {
                        socket.noti("Giao dịch thất bại do bạn đã có tối đa x99 "+infoItem.name+" không thể nhận thêm "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do đối phương đa mang tối đa x99 "+infoItem.name+"  không thể nhận thêm "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                }
                else 
                {
                    if(player1_slot_free < 1) {
                        socket.noti("Giao dịch thất bại do bạn không có đủ chỗ trống để nhận "+infoItem.name+" x "+e.soluong+" .");
                        socket.sendToNoti("Giao dịch thất bại do đối phương không có đủ chỗ trống để nhận "+infoItem.name+"  x "+e.soluong+" ",player2.id);
                        return closeBox(socket);
                    }
                    player1_slot_free--;
                }
            }


        }


        // thực hiện giao dịch

        // trừ vàng player1
        player1.tien.vang -= dang_my.vang;
        player2.tien.vang += dang_my.vang;

        // trừ vàng player2

        player2.tien.vang -= dang_target.vang;
        player1.tien.vang += dang_target.vang;

        // trừ item player1
        for (let i = 0; i < player1_ListItem.length; i++) {
            let e = player1_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            let myItem = player1.ruong.item.find(e2=>e2.id == e.id);
            if(infoItem.type == 'trangbi') 
            {
                // delete item
                player1.ruong.item = player1.ruong.item.filter(e2=>e2.id != myItem.id);
            }
            else 
            {
                myItem.soluong -= e.soluong;
                if(myItem.soluong <= 0) player1.ruong.item = player1.ruong.item.filter(e2=>e2.id != myItem.id);
            }
        }

        // trừ item player2

        for (let i = 0; i < player2_ListItem.length; i++) {
            let e = player2_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            let myItem = player2.ruong.item.find(e1=>e1.id == e.id);
            if(infoItem.type == 'trangbi') 
            {
                // delete item
                player2.ruong.item = player2.ruong.item.filter(e2=>e2.id != myItem.id);
            }
            else 
            {
                myItem.soluong -= e.soluong;
                if(myItem.soluong <= 0) player2.ruong.item = player2.ruong.item.filter(e2=>e2.id != myItem.id);
            }
        }

        // thêm item player1

        for (let i = 0; i < player2_ListItem.length; i++) {
            let e = player2_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            let myItem = player2.ruong.item.find(e2=>e2.id == e.id);
            if(infoItem.type == 'trangbi') 
            {
                // add item
                player1.ruong.item.push(e);
            }
            else 
            {
                let playerItem = player1.ruong.item.find(e2=>e2.item == e.item && e2.active == 'hanhtrang');
                if(playerItem) {
                    playerItem.soluong += e.soluong;
                } 
                else 
                {
                    player1.ruong.item.push(e);
                }
            }
        }

        // thêm item player2

        for (let i = 0; i < player1_ListItem.length; i++) {

            let e = player1_ListItem[i];
            let infoItem = item.find(e2=>e2.id == e.item);
            let myItem = player1.ruong.item.find(e2=>e2.id == e.id);
            if(infoItem.type == 'trangbi') 
            {
                // add item
                player2.ruong.item.push(e);
            }
            else 
            {
                let playerItem = player2.ruong.item.find(e2=>e2.item == e.item && e2.active == 'hanhtrang');
                if(playerItem) {
                    playerItem.soluong += e.soluong;
                }
                else 
                {
                    player2.ruong.item.push(e);
                }
            }
        }

        // thực hiện xong giao dịch

        dang_my.xong = 1;

        socket.sendTo({
            tien : player1.tien,
            ruong : player1.ruong,
        },player1.id,"doneGiaoDich");

        socket.sendTo({
            tien : player2.tien,
            ruong : player2.ruong,
        },player2.id,"doneGiaoDich");

        giaodich.dang = giaodich.dang.filter(e=>e.from != socket.uid);
        giaodich.dang = giaodich.dang.filter(e=>e.from != dang_my.to);

        db.setPlayer(player1);

        process.send({
            since04: {
                type : 'giaodich',
                uid : player2.id,
                data : {
                    tien : player2 .tien,
                    ruong : player2.ruong,
                }
            }
        })


    }
    else 
    {
        dang_my.xong = 1;
        socket.send(1,"daxonggiaodich");
        socket.sendTo(1, dang_my.to,"doiphuongdakhoa");
        db.setPlayer(my);
    }

    await db.setGiaodich(giaodich);




}

let closeBox = async function(socket)
{
    socket.send(1,"closebox");
    let giaodich = await db.getGiaodich();
    let dang_my = giaodich.dang.find(e=>e.from == socket.uid);
    if(dang_my) {
        socket.sendTo(1,dang_my.to,"closebox");
        giaodich.dang = giaodich.dang.filter(e=>e.from != socket.uid);
        giaodich.dang = giaodich.dang.filter(e=>e.from != dang_my.to);
    }
    await db.setGiaodich(giaodich);
}

let huygiaodich = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    let giaodich = await db.getGiaodich();
    let dang_my = giaodich.dang.find(e=>e.from == socket.uid);


    let target = await db.getPlayer(dang_my.to);

    socket.sendTo(1,dang_my.to,"doiphuonghuygiaodich");
    closeBox(socket);
    socket.sendCode("huygiaodichthanhcong");
}

let statusGiaoDich =async function(socket) 
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    let giaodich = await db.getGiaodich();
    let dang_my = giaodich.dang.find(e=>e.from == socket.uid);

    if(!dang_my) return socket.sendCode("loigiaodich");

    let target = await db.getPlayer(dang_my.to);
    if(!target) {
        closeBox(socket);
        return socket.sendCode("huygiaodichkhongonline");
    }

}

module.exports = function(client,data)
{
    if(typeof data != "object") return false;
    if(data._1 == 1) return moigiaoDich(client,data);
    if(data._1 == 2) return khongChapNhan(client,data);
    if(data._1 == 3) return chapNhan(client,data);
    if(data._1 == 4) return khoaGiaoDich(client,data);
    if(data._1 == 5) return xongGiaoDich(client,data);
    if(data._1 == 9) return statusGiaoDich(client,data);
    if(data._1 == 6) return huygiaodich(client,data);



}