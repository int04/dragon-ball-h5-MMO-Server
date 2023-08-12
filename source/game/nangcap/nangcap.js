
let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');
let redis = require('../../Model/redis.js');

let cuonghoa = function(socket,data)
{
    let idvp = data._2;
    let iditem = data._3;
    socket.dangnangcap = socket.dangnangcap || 0;
    if(socket.dangnangcap == 1) {
        socket.chipi("Thao tác quá nhanh");
        return false;
    }
    socket.dangnangcap = 1;
    if(!idvp || !iditem) return console.log('Không có id vp hoặc id item');

    if(socket.uid <=0) return false;

    let my = socket.my; 

    if(!my) return false;

    let trangbi = my.ruong.item.find(e=>e.id == idvp);
    if(!trangbi) return console.log('Không có trang bị này');

    let da = my.ruong.item.find(e=>e.id == iditem);
    if(!da) return socket.noti('Bạn đã hết đá');


    let infoTrangbi = item.find(e=>e.id == trangbi.item);
    if(!infoTrangbi) return console.log('Không có trang bị này trong csdl');

    let infoDa = item.find(e=>e.id == da.item);
    if(!infoDa) return console.log('Không có đá này trong csdl');

    if(infoTrangbi.type != 'trangbi') return console.log('Không phải trang bị');
    if(infoDa.type != 'item') return console.log('Không phải đá');

    if(infoTrangbi.type2 != infoDa.type3) return console.log('Không phải đá của trang bị này');

    if(infoTrangbi.level >= 7) {
        socket.dangnangcap = 0;
        return socket.noti('Trang bị đã tối đa cấp độ');
    }


    let tile = {
        "ao" : [90,80,70,50,30,10,5],
        "quan" : [95,80,72,61,33,10,3],
        "gang" : [70,50,40,20,15,2,1],
        "giay" : [99,90,80,50,30,10,5], 
        "rada" : [70,60,50,40,30,20,10],
    };
    let thuoctinh = {
        "ao" : [10,12,13,14,15,16,17],
        "quan" : [10,15,20,25,30,35,40],
        "gang" : [5,10,15,18,20,33,35],
        "giay" : [10,12,13,14,15,16,17],
        "rada" : [5,5,5,5,5,5,5],
    };
    let itemcan = {
        "ao" : [10,20,35,42,51,60,78],
        "quan" : [15,30,50,65,75,85,90],
        "gang" : [10,20,30,40,50,60,70],
        "giay" : [10,20,35,42,51,60,78],
        "rada" : [10,20,35,42,51,60,78],
    }
    let vangcan = {
        "ao" : [10000,60000,150000,356000,925000,1250000,2104000],
        "quan" : [10000,60000,150000,356000,925000,1250000,2104000],
        "gang" : [20000,90000,550000,1356000,1925000,31250000,41250000],
        "giay" : [10000,60000,150000,256000,725000,1250000,2104000],
        "rada" : [10000,60000,150000,356000,925000,1250000,2104000],
    }

    let tilethanhcong = tile[infoTrangbi.type2][trangbi.level];
    let thuoctinhthanhcong = thuoctinh[infoTrangbi.type2][trangbi.level];
    let itemcanthanhcong = itemcan[infoTrangbi.type2][trangbi.level];
    let vangcanthanhcong = vangcan[infoTrangbi.type2][trangbi.level];

    if(!tilethanhcong || !thuoctinhthanhcong || !itemcanthanhcong || !vangcanthanhcong){
        socket.dangnangcap = 0;
        return console.log('Không có thông tin thành công');
    } 

    if(da.soluong < itemcanthanhcong) {
        socket.dangnangcap = 0;
        return socket.chipi('Cần thêm '+(itemcanthanhcong - da.soluong)+'  '+infoDa.name+'');
    }
    if(my.tien.vang < vangcanthanhcong) {
        socket.dangnangcap = 0;
        return socket.chipi('Bạn còn thiếu '+(vangcanthanhcong - my.tien.vang)+' vàng.');
    }

    let rand = string.rand(0,100 + (trangbi.level * 10));
    let success = 0;
    trangbi.sitnangcap = trangbi.sitnangcap || 0;
    if(rand > tilethanhcong) {
        // thất bại
        if(trangbi.level > 1 && trangbi.sit !=1) 
        {
            for(let t in infoTrangbi.info)
            {
                if(infoTrangbi.info[t] <=0) continue;
                trangbi.info[t] -= Math.floor(trangbi.info[t]/100* 1);
            }
            trangbi.sit = 1;
        }
        socket.dangnangcap = 0;
        trangbi.sitnangcap += 1;
    }
    else{
        // thành công
        trangbi.level += 1;
        for(let t in infoTrangbi.info)
        {
            if(infoTrangbi.info[t] <=0) continue;
            trangbi.info[t] += Math.ceil(trangbi.info[t]/100* thuoctinhthanhcong);
            trangbi.sit = 0;
        }
        success = 1;
    }


    
    my.tien.vang -= vangcanthanhcong;

    let b = string.setItem(my.id,da.item,-itemcanthanhcong,infoDa,my);
    if(typeof b == 'object') {
        my = b;
    }
    else{
        console.log('b',b)
    }

    redis.setPlayer(my).then(() => {
        socket.send({
            ruong : my.ruong,
            tien : my.tien,
            success : success,
            idvp : infoTrangbi.avatar,
            da : infoDa.avatar,
        },'cuonghoa');
        socket.dangnangcap = 0;
    });

}

let duclo = function(socket,data)
{
    let idvp = data._2;
    if(socket.uid <=0) return false;
    if(!idvp) return console.log('Không có id vp');

    if(socket.awaitDucLo == true) return console.log('Đang thực hiện đục lỗ');
    socket.awaitDucLo = true;

    redis.getPlayer(socket.uid).then(my => {
        if(!my) {
            return false;
        }

        let trangbi = my.ruong.item.find(e=>e.id == idvp);
        let infoTrangbi = item.find(e=>e.id == trangbi.item);
        if(!infoTrangbi) {
            socket.awaitDucLo = false;
            return console.log('Không có trang bị này trong csdl');
        }
        if(infoTrangbi.type != 'trangbi') {
            socket.awaitDucLo = false;
            return socket.noti('Vật phẩm này không phải trang bị');
        }
        if(infoTrangbi.type2 == 'caitrang') {
            socket.awaitDucLo = false;
            return socket.noti('Không thể đục lỗ cho trang bị này');
        }
    
        let sao = trangbi.sao; 
        sao = typeof sao == 'object' ? sao : [0,0,0,0,0,0,0];
    
        let saoconlai = sao.filter(e=>e == 0).length;
        if(saoconlai <=0) {
            socket.awaitDucLo = false;
            return socket.noti('Trang bị đã đục lỗ đầy');
        }
    
        let vangcan = [5,10,20,40,80,90,120];
        let tile = [50,40,30,20,10,5,2];
    
        let tongsaodaduc = sao.filter(e=>e != 0).length;
        let tilethanhcong = tile[tongsaodaduc];
        let vangcanthanhcong = vangcan[tongsaodaduc] * 1000000;
    
        if(my.tien.vang < vangcanthanhcong) {
            socket.awaitDucLo = false;
            return socket.noti('Bạn còn thiếu '+(vangcanthanhcong - my.tien.vang)+' vàng.');
        }
    
        let rand = string.rand(0,100 + (tongsaodaduc * 10 + (tongsaodaduc*5)*string.rand(5,20)));
    
        let success = 0;
        if(rand > tilethanhcong) {
            // thất bại 
        }
        else 
        {
            let slotnone = sao.findIndex(e=>e == 0);
            sao[slotnone] = -1;
            success = 1;
        }
    
        my.tien.vang -= vangcanthanhcong;
    
        trangbi.sao = sao;
    
    
        redis.setPlayer(my).then(() => {
            socket.awaitDucLo = false;
            socket.send({
                ruong : my.ruong,
                tien : my.tien,
                success : success,
                idvp : infoTrangbi.avatar,
            },'duclo');
        });
    });

}

let expsao = function(socket,data)
{
    let idvp = data._2;
    let iditem = data._3;
    if(socket.uid <=0) return false;
    if(!idvp) return console.log('Không có id vp');
    if(!iditem) return console.log('Không có id item');

    if(socket.awaitEpSao == true) return console.log('Đang thực hiện ép sao');
    socket.awaitEpSao = true;

    redis.getPlayer(socket.uid).then(my => {
        if(!my) return false;

        let trangbi = my.ruong.item.find(e=>e.id == idvp);
        let infoTrangbi = item.find(e=>e.id == trangbi.item);
        if(!infoTrangbi) {
            socket.awaitEpSao = false;
            return console.log('Không có trang bị này trong csdl');
        }
        if(infoTrangbi.type != 'trangbi') {
            socket.awaitEpSao = false;
            return socket.noti('Vật phẩm này không phải trang bị');
        }
    
        let phale = my.ruong.item.find(e=>e.id == iditem);
        if(!phale) {
            socket.awaitEpSao = false;
            return socket.noti('Bạn đã hết sao pha lê.');
        }

        let infoPhale = item.find(e=>e.id == phale.item);
        if(!infoPhale) {
            socket.awaitEpSao = false;
            return socket.noti('Không có sao pha lê này trong csdl');
        }
        if(!infoPhale.thuoctinh) {
            socket.awaitEpSao = false;
            return socket.noti('Sao pha lê này không có thuộc tính.');
        }
        if(infoPhale.value <= 0) {
            socket.awaitEpSao = false;
            return socket.noti('Sao pha lê này không có thuộc tính.');

        }
        if(phale.soluong <=0) {
            socket.awaitEpSao = false;
            return socket.noti('Bạn đã hết sao pha lê.');
        }
    
        if(my.tien.zeni <10) {
            socket.awaitEpSao = false;
            return socket.chipi('Bạn còn thiếu '+(10 - my.tien.zeni)+' zeni.');
        }
    
        let sao = trangbi.sao;
        sao = typeof sao == 'object' ? sao : [0,0,0,0,0,0,0];
    
        let saoden = sao.filter(e=>e == -1).length;
        if(saoden <=0) {
            socket.awaitEpSao = false;
            return socket.noti('Trang bị không còn lỗ trống để ép sao pha lê này');
        }
    
        let vitri = sao.findIndex(e=>e == -1);
        sao[vitri] = phale.item;
        trangbi.sao = sao;
    
        trangbi.info[infoPhale.thuoctinh] = trangbi.info[infoPhale.thuoctinh] || 0;
        trangbi.info[infoPhale.thuoctinh] += infoPhale.value*1;
    
        my = string.setItem(my.id,phale.item,-1,infoPhale,my);
        my.tien.zeni -= 10;
    
        redis.setPlayer(my).then(() => {
            socket.awaitEpSao = false;
            socket.send({
                ruong : my.ruong,
                tien : my.tien,
                idvp : infoTrangbi.avatar,
                idphale : infoPhale.avatar,
            },'expsao');
        });
    });


}

module.exports = function(socket,data)
{
    if(typeof data != 'object') return false;
    if(data._1 == 1) return cuonghoa(socket,data); 
    if(data._1 == 2) return duclo(socket,data);
    if(data._1 == 3) return expsao(socket,data);

}