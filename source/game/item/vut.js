let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');
let redis = require('../../Model/redis.js');
module.exports = function(socket,data) 
{
    if(socket.uid <= 0) return socket.sendCode(-999);

    if(socket.dangvut == true) return console.log('Đang thực hiện');

    socket.dangvut = true;

    let my = socket.my;

    if(!my) return socket.sendCode(-999);
    if(!data) return socket.sendCode(-96);
    if(my && my.ruong && my.ruong.item && ( typeof data == 'number' || typeof data == 'string')) 
    {
        let inBag = my.ruong.item.find(e => e.id == data);
        if(inBag)
        {
            let itemInfo = item.find(e => e.id == inBag.item);
            if(!itemInfo) {
                socket.dangvut= false;
                return socket.sendCode(-94);
            }
            if(itemInfo && itemInfo.camvut && itemInfo.camvut == true) {
                socket.dangvut= false;
                return socket.sendCode(-93);
            }
            if(inBag && inBag.khoa && inBag.khoa == 1) {
                socket.dangvut= false;
                return socket.sendCode(-92);
            }
            if(inBag.active == "trangbi") {
                socket.dangvut= false;
                return socket.sendCode(-91);
            }

            let IDredis =string.az(10);
            // delete item in bag
            let datasave = {
                time_con : Date.now() + 30*1000, // tim người khác có thể nhặt
                time_vut : Date.now(), // thời gian vứt
                time_dat : Date.now() + 60 * 1000, // thời còn 
                data : inBag,
                pos : {
                    x : my.pos.x,
                    y : my.pos.y,
                    map : my.pos.map, 
                    zone : my.pos.zone,
                },
                id : IDredis,
                uid : my.id,
            };

            my.ruong.item = my.ruong.item.filter(e => e.id != data);

            if(itemInfo.type == 'trangbi' && itemInfo.type2 == 'caitrang') {
                console.log('Mất luôn')
            }
            else 
            {
                
                redis.setItem(IDredis,datasave).then(data => {
                    socket.sendMap({
                        _l : string.rand(1,100),
                        _1 : datasave,
                        _2 : my.id, // người vứt
                    })
                });
            }
            
            redis.setPlayer(my.id,my).then(data => {
                socket.send({
                    _i : string.rand(1,100),
                    _1 : my.ruong, 
                    _2 : my.trangbi,
                })
                socket.sendCode(-6)
                socket.dangvut= false;
            });
        }
        else 
        {
            socket.dangvut= false;
            return socket.sendCode(-95);
        }
    }
    else 
    {
        return socket.sendCode(-96);
    }
    
}