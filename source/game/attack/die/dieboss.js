
let string = require('../../../Model/string.js');
let item = require('../../../Model/base/item.js');
module.exports = function(socket,my,boss) 
{
    /**
     * @return
     * @socket : socket
     * @idboss : id boss
     * @boss : boss info
     */

    // xử lý nhiệm vụ hoặc rơi các sp
    socket.sendAll(''+my.name+' vừa tiêu diệt '+boss.name+' mọi người đều ngưỡng mộ ','server');
    if(boss.hoisinh > 0) 
    {
        // hồi sinh boss, 
        BOSS_DIE.push({
            id : boss.id,
            time : Date.now() + boss.hoisinh*60*1000,
        })
    }

    if(boss && boss.item)
    {
        let list = boss.item;
        list.forEach(element => {
            let iditem = element.id;
            let soluong = element.soluong;
            let tile = element.tile;
            let rand = string.rand(1,100);
            let docquyen = element.all || 0;
            let hsd = element.hsd*1000*86500 + Date.now() || 0;
            docquyen = docquyen == 0 ? 0 : Date.now() + 30*1000;

            if(rand <= tile)
            {
                // rơi ra đất
                let infoItem = item.find(e => e.id == iditem);
                if(infoItem) 
                {
                    let data  = {
                        time_con : docquyen, // tim người khác có thể nhặt
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

                    // nếu là trang bị
                    if(infoItem.type == 'trangbi' && infoItem.type2 != 'caitrang')
                    {
                        let info = {};
                        let bouns = string.rand(1,20);
                        // coppy infoItem.info vào info
                        for (const key in infoItem.info) {
                            info[key] = infoItem.info[key] + infoItem.info[key]  /100 * 10;
                            info[key] = Math.round(info[key]);
                        }
                        data.data = {
                            info : info,
                            id : string.az(10),
                            item : infoItem.id,
                            soluong : 1,
                            active : 'dat',
                            lastTime : Date.now(),
                            khoa : infoItem.khoa || 0,
                            hsd : hsd,
                            level : 0,
                        }
                    }
                    else
                    if(infoItem.type == 'trangbi' && infoItem.type2 == 'caitrang')
                    {
                        
                        data.data = {
                            info : infoItem.info,
                            id : string.az(10),
                            item : infoItem.id,
                            soluong : 1,
                            active : 'dat',
                            lastTime : Date.now(),
                            khoa : infoItem.khoa || 0,
                            hsd : hsd,
                        }
                    }
                    else
                    if(infoItem.type == 'item')
                    {
                        data.data = {
                            id : string.az(10),
                            item : infoItem.id,
                            soluong : soluong,
                            active : 'dat',
                            lastTime : Date.now(),
                            khoa : infoItem.khoa || 0,
                            hsd : hsd,
                        } 
                    }
                    else 
                    {
                        data.data = {
                            item : infoItem.id,
                            soluong : soluong,
                        }
                    }


                    vatpham.push(data)
                    socket.sendMap({
                        _l : string.rand(1,100),
                        _1 : data,
                        _2 : 0, // người vứt
                    })
                }

            }
        });
    }
}