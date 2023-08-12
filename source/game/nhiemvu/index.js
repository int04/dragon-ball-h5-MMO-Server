
let string = require("../../Model/string.js");
let nhiemvu = require("../../Model/base/nhiemvu");
let item = require("../../Model/base/item");
let redis = require("../../Model/redis.js");
module.exports = function(socket,send) 
{
    if(socket.uid <=0) return false;
    if(socket.awaitNhiemVu == true) return console.log('Đang thực hiện nhiệm vụ');
    socket.awaitNhiemVu = true;

    let my = socket.my; 

    if(!my) {
        socket.awaitNhiemVu= false;
        return false;
    }

    let dataNhiemVu = nhiemvu.find(e => e.id == my.nhiemvu.id && (e.class == my.info.coban.type || e.class == 'all'));
    if(!dataNhiemVu) {
        socket.awaitNhiemVu= false;
        return false;
    }
    my = string.info(my);

    if(!my.nhiemvu.data.id) {
        socket.awaitNhiemVu= false;
        return socket.chipi("tạm thời chưa có nhiệm vụ");
    }
    if(my.nhiemvu.data.type != 'talk') {
        socket.awaitNhiemVu= false;
        return socket.chipi("Hãy lên đường làm nhiệm vụ đi nào.");
    }

    let data = dataNhiemVu.list[my.nhiemvu.now];
    if(!data) {
        socket.awaitNhiemVu= false;
        return socket.chipi("Không đọc được dữ liệu.");
    }

    if( data.thuong &&  data.thuong.item && string.checkRuong(my) < data.thuong.item.length) {
        socket.awaitNhiemVu= false;
        return socket.chipi("Rương đồ cần trống "+data.thuong.item.length+" để hoàn thành.");
    }

    // xử lý loại nhiệm vụ talk and need

    let itemNeed = [];
    if(data.need) {
        for(let id in data.need) {
            let soluong = data.need[id];
            itemNeed.push({
                id : id,
                soluong : soluong,
            });
        }
    }

    // kiểm tra hành trang có đủ vật phẩm không
    itemNeed.forEach(element => {
        let myItem = my.ruong.item.find(e=>e.item == element.id && e.active == 'hanhtrang');
        if(!myItem) {
            socket.awaitNhiemVu= false;
            return socket.chipi("Bạn chưa có "+item.find(e=>e.id == element.id).name);
        }
        if(myItem.soluong < element.soluong) {
            socket.awaitNhiemVu= false;
            return socket.chipi("Bạn không đủ "+item.find(e=>e.id == element.id).name);
        }
    });

    // xử lý trừ item
    itemNeed.forEach(element => {
        let myItem = my.ruong.item.find(e=>e.item == element.id && e.active == 'hanhtrang');
        if(myItem) {
            myItem.soluong-=element.soluong;
            if(myItem.soluong <=0) {
                my.ruong.item.splice(my.ruong.item.indexOf(myItem),1);
            }
        }
    });


    my.nhiemvu.now+=1;
    my.nhiemvu.data = {};



    if(!!data.thuong) {
        if(data.thuong.exp >=1)
        socket.chipi("Bạn nhận được "+data.thuong.exp+" tiềm năng, sức mạnh.");
        if(data.thuong.vang >=1)
        socket.chipi("Bạn nhận được "+data.thuong.vang+" vàng.");

        if(data.thuong.exp)
        {
            my.info.coban.sucmanh += data.thuong.exp;
            my.info.coban.tiemnang += data.thuong.exp;
        }
        
        if(data.thuong.vang) {
            my.tien.vang += data.thuong.vang;
        }
    
        if(data.thuong.item && data.thuong.item.length > 0) {
            for (let i = 0; i < data.thuong.item.length; i++) {
                let element = data.thuong.item[i];
                let inItem = item.find(e=>e.id == element.id);
                if(!inItem) continue;
                // check item
                if(inItem.type == 'trangbi') {
                    my.ruong.item.push({
                        id : string.az(10),
                        active : 'hanhtrang',
                        info : inItem.info,
                        item : inItem.id,
                        soluong : 1, 
                        khoa : 0,
                        level : 0,
                        sao : 0,
                        saotrong : 0, 
                        lastTime : Date.now(),
    
                    }) 
                }
                else {
                    let myItem = my.ruong.item.find(e=>e.item == element.id && e.active == 'hanhtrang');
                    if(myItem) 
                    {
                        myItem.soluong+=element.soluong;
                    }
                    else 
                    {
                        my.ruong.item.push({
                            id : string.az(10),
                            active : 'hanhtrang',
                            item : element.id,
                            soluong : element.soluong, 
                            lastTime : Date.now(),
                            khoa : element.khoa || 0,
                        });
                    }
    
                }
                socket.chipi("Bạn nhận được "+element.soluong+" "+inItem.name);
    
                
            }
        }
    }
    
    my = string.info(my);
    
    redis.setPlayer(my).then(() => {
        socket.send({
            nhiemvu : my.nhiemvu,
            ruong : my.ruong,
            tien : my.tien,
            info : my.info,
        },"nhiemvusuccess");
        socket.awaitNhiemVu= false;
    
        string.update(my);
    });


}