
let map = require('../../Model/base/map.js');
let vaokhu = require('./vaokhu.js');
let string = require('../../Model/string.js');
let maxZone = 12;

let redis = require('../../Model/redis.js');

let chuyenKhu = require('./chuyenKhu.js');
let ChangeKhu = function(socket,data)
{
    if(socket.uid <=0) return false;
    
    let my = socket.my;

    if(!my) return false;
    let findMap = map.find(e => e.id == my.pos.map);
    if(!findMap) return console.log('không tìm thấy bản đồ');
    if(findMap.max && findMap.max == 1) return socket.sendCode(-9828);
    findMap.zone = findMap.zone || maxZone;

    data = data >> 0;
    data = data < 0 ? 0 : data;
    data = data > findMap.zone ? findMap.zone : data;

    chuyenKhu.checked(my.pos.map,data).then(data3 => {
        if(data3 == false) return socket.sendCode(-9829);
        socket._sendMap(my.id,-86);
        if(my.detu && my.detu.id && my.detu.info && my.detu.info.trangthai != 'venha') socket._sendMap(my.detu.id,-86); 
        my.pos.zone = data;
        redis.setPlayer(my.id,my).then(data2 => {
            socket.joinMap(my.pos.map,my.pos.zone);
            socket.send({
                _ba : string.az(5),
                _1 : my.pos.zone,
            })
        });
    });
    

}
let playerOnMap  = function(socket,data)
{
    if(socket.uid <=0) return false;
    
    let my = socket.my;

    if(!my) return false;

    let findMap = map.find(e => e.id == my.pos.map);
    if(!findMap) return console.log('không tìm thấy bản đồ');
    if(findMap.max && findMap.max == 1) return socket.sendCode(-9828);

    findMap.zone = findMap.zone || maxZone;
    let deuconguoi = 0;

    let zone = [];



    for(let i = 0; i <= findMap.zone; i++)
    {
        zone.push({
            _1 : i,
            _2 : 0, 
        })
    }

    Promise.all(zone.map((zoneData,index) => {

        return new Promise((resolve,reject) => {
                
            redis.playerInZone(my.pos.map,zoneData._1).then(data => {
                data.forEach(element => {
                    if(element.of == undefined) zone[index]._2++;
                });
                if(data.length > 0) deuconguoi++;
                resolve();
            });
        });

    })).then(data => {
        if(deuconguoi == findMap.zone) {
            findMap.zone+=1; // tạo thêm khu mới khi toàn bộ khu đều có người.
            zone.push({
                _1 : findMap.zone,
                _2 : 0,
            })
        }
        socket.send({
            _aa : string.az(10),
            _1 : zone,
            _2 : 12,
        })
    });

    

}

module.exports = function (socket,data)
{ 
    if(data == 'ob') 
    {

        playerOnMap(socket,data);
    }
    else 
    {
        ChangeKhu(socket,data);
    }
}