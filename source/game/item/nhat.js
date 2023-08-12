let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');

let redis = require('../../Model/redis.js');

let nhiemvu = require('../../Model/base/nhiemvu.js');

module.exports = function (socket,data) {

    if(!socket.uid) return socket.sendCode(-999);
    let id = data;

    if(socket.awaitNhai == true) return console.log('await Nhai');
    socket.awaitNhai = true;

    let itemDB = redis.getItem(id);

    let my = socket.my;

    Promise.all([itemDB]).then(res => {
        let cache_VP = res[0];

        if(!my) {
            socket.awaitNhai = false;
            return socket.sendCode(-999);
        }

        if(!cache_VP) {
            socket.awaitNhai = false;
            return console.log('Không tìm thấy item');
        }

        if(cache_VP && cache_VP.uid != my.id) {
            if(cache_VP.time_con >= Date.now()) {
                socket.awaitNhai = false;
                return socket.sendCode(-90);
            }
        }

        let itemInfo = item.find(e => e.id == cache_VP.data.item);
        if(!itemInfo) {
            socket.awaitNhai = false;
            return console.log('Không tìm được item')
        }

        if(itemInfo && itemInfo.type == 'tien')  {
            // nếu là tiền vàng thì cộng vào tài khoản
            if(itemInfo.type2 == 'vang') 
            {
                socket.send(cache_VP.data.soluong,"nhatvang");
            }
            if(itemInfo.type2 == 'zeni') 
            {
                socket.send(cache_VP.data.soluong,"nhatngoc");
            }

            my.tien[itemInfo.type2] += cache_VP.data.soluong * 1;

            Promise.all([redis.setPlayer(my.id,my),redis.delItem(id)]).then(res => {
                socket.sendMap(data,-86);
                socket.awaitNhai = false;
            });

        }

        if(itemInfo && itemInfo.type == 'trangbi') 
        {
            if(string.checkRuong(my) <=0) {
                socket.awaitNhai = false;
                return socket.sendCode(-89);
            }
            cache_VP.data.active = 'hanhtrang';
            cache_VP.data.lastTime = Date.now();
            my.ruong.item.push(cache_VP.data);

            Promise.all([redis.setPlayer(my.id,my),redis.delItem(id)]).then(res => {
                socket.send({
                    _1 : my.ruong, 
                },-85)
                socket.send({
                    _1 : cache_VP.data.item,
                    _2 : cache_VP.data.soluong
                },-87)
                socket.sendMap(data,-86);
                socket.awaitNhai = false;
            });
        }

        if(itemInfo && itemInfo.type == 'item') 
        {
            let daco = my.ruong.item.find(e => e.item == itemInfo.id && e.active == 'hanhtrang');
            if(daco) {
                if(daco.soluong+cache_VP.data.soluong >= 99) {
                    socket.awaitNhai = false;
                    return socket.sendCode(1511);
                }
                daco.soluong = daco.soluong*1 + cache_VP.data.soluong;
            }
            else 
            {
                cache_VP.data.active = 'hanhtrang';
                cache_VP.data.lastTime = Date.now();
                if(string.checkRuong(my) <=0) {
                    socket.awaitNhai = false;
                    return socket.sendCode(1311);
                }
                my.ruong.item.push(cache_VP.data);
            }


            // kiểm tra nhiệm vụ

            let myNhiemVu = socket.my.nhiemvu;
            let idnhiemvu = myNhiemVu.id;
            let elmentID = myNhiemVu.now;
    
            let data_nhiemvu = nhiemvu.find(e => e.id == idnhiemvu);
            let updated = 0;
            if(data_nhiemvu) {
    
                let list = data_nhiemvu.list[elmentID];
                if(list && list.item) {
                    for(let idItem in list.item) {
                        if(idItem ==itemInfo.id ) {
                            myNhiemVu.data.have+=1;
                            updated = 1;
                            if(myNhiemVu.data.have >= list.value) {
                                socket.chipi("Bạn đã hoàn thành nhiệm vụ. Tiếp tục nhiệm vụ mới nào");
                            }
                        }
                    }
                }
            }
            if(updated ==1) {
                my = string.info(my);
                socket.send(my.nhiemvu,"updatedQuest")
            }

            

            Promise.all([redis.setPlayer(my.id,my),redis.delItem(id)]).then(res => {
                socket.send({
                    _1 : my.ruong, 
                },-85)
                socket.send({
                    _1 : cache_VP.data.item,
                    _2 : cache_VP.data.soluong
                },-87)
                socket.sendMap(data,-86);
                socket.awaitNhai = false;
            });

        }

    });




}