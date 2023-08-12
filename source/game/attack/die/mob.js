let string = require('../../../Model/string.js');
let mob = require('../../../Model/base/quai.js');
let redis = require('../../../Model/redis.js');
let nhiemvu = require('../../../Model/base/nhiemvu.js');
let item = require('../../../Model/base/item.js');
module.exports = function(socket, my,infoTo = null) 
{
    // xử lý nhiệm vụ 
    if(socket.uid == my.id) {
        let myNhiemVu = socket.my.nhiemvu;
        let idnhiemvu = myNhiemVu.id;
        let elmentID = myNhiemVu.now;

        let data_nhiemvu = nhiemvu.find(e => e.id == idnhiemvu);
        if(data_nhiemvu) {

            let list = data_nhiemvu.list[elmentID];
            if(list && list.type && list.type == 'kill' && list.id == infoTo.uid) {
                // xử lý nhiệm vụ
                myNhiemVu.data.have+=1;
                if(myNhiemVu.data.have >= list.value) {
                    socket.chipi("Bạn đã hoàn thành nhiệm vụ. Tiếp tục nhiệm vụ mới nào");
                }
                my = string.info(socket.my);
                socket.send(my.nhiemvu,"updatedQuest")
            }
            if(list && list.item) {
                for(let idItem in list.item) {
                    let tile = list.item[idItem];
                    let itemInfo = item.find(e => e.id == idItem);
                    if(itemInfo) {
                        let rand = string.rand(1,100);
                        if(rand <= tile) {
                            if(itemInfo.type == 'item') {
                                let data  = {
                                    time_con : Date.now() + 30000, // tim người khác có thể nhặt
                                    time_vut : Date.now(), // thời gian vứt
                                    time_dat : Date.now() + 60 * 1000, // thời còn 
                                    pos : {
                                        x : string.rand(my.pos.x-200, my.pos.x+200),
                                        y : my.pos.y,
                                        map : my.pos.map, 
                                        zone : my.pos.zone,
                                    },
                                    id : string.az(10),
                                    uid : my.id,
                                    data : {},
                                };

                                if(my.nhiemvu && my.nhiemvu.data && my.nhiemvu.data.type && my.nhiemvu.data.type == 'get' && my.nhiemvu.data.need == 1) {
                                    socket.chipi("Đã tìm thấy vật phẩm, nhặt nào.");
                                    my.nhiemvu.data.have = 1;
                                    my = string.info(my);
                                    socket.send(my.nhiemvu,"updatedQuest")
                                }

                                data.data = {
                                    id : string.az(10),
                                    item : itemInfo.id,
                                    soluong : 1,
                                    active : 'dat',
                                    lastTime : Date.now(),
                                    khoa : itemInfo.khoa || 0,
                                } 

                                redis.setItem(data).then(() => {
                                    socket.sendMap({
                                        _l : string.rand(1,100),
                                        _1 : data,
                                        _2 : 0, // người vứt
                                    })
                                });

                            }
                        }
                    }
                    
                }
            }
        }

    }

    // end code nhiệm vụ
    let mobInfo = mob.find(e => e.id == infoTo.uid);

    // rớt vàng =] 
    let rand = string.rand(1,100);
    if(rand <=50 && mobInfo && mobInfo.money) 
    {
        let vangroi = string.rand(mobInfo.money[0],mobInfo.money[1]);
        vangroi*=1;
        if(infoTo && infoTo.info && infoTo.info.coban && infoTo.info.coban.sieuquai >= 1) vangroi*=infoTo.info.coban.sieuquai;
        if(vangroi >=1) 
        {
            for(let i = 0; i <1; i++) {
                let redisID = string.az(10);
                let datasave = {
                    time_con : Date.now() + 30*1000, // tim người khác có thể nhặt
                    time_vut : Date.now(), // thời gian vứt
                    time_dat : Date.now() + 60 * 1000, // thời còn 
                    data : {
                        item : 'ock',
                        soluong : vangroi,
                    },
                    pos : {
                        x : my.pos.x,
                        y : my.pos.y,
                        map : my.pos.map, 
                        zone : my.pos.zone,
                    },
                    id : redisID,
                    uid : my.id,
                }; 
                
                redis.setItem(redisID,datasave).then(() => {
                    socket.sendMap({
                        _l : string.rand(1,100),
                        _1 : datasave,
                        _2 : 0, // người vứt
                    })
                });
            }

        }
    }
    return my;
}