
let vao = require('../../Model/base/vao.js');
let string = require('../../Model/string.js');
let map = require('../../Model/base/map.js');

let redis = require('../../Model/redis.js');

module.exports = function(socket,data)
{
    if(socket.uid <=0) return false;
    let id = data; 
    
    let my = socket.my;

    if(my) 
    {

        let baseVao = vao.find(e => e.id == id);
        if(!baseVao) return console.log('Không tìm thấy vị trí vào');
        let target = baseVao.target;
        let baseMap = map.find(e => e.id == target.map);
        if(!baseMap) return console.log('Không tìm thấy map');

        if(baseMap.hanhtinh != 'all' && my.info.coban.type != baseMap.hanhtinh) return socket.sendCode("notJoin");

        if(baseMap.nhiemvu && baseMap.nhiemvu >=1 && my.nhiemvu && my.nhiemvu.id < baseMap.nhiemvu) return socket.sendCode("notQuest");

        my.pos.map = target.map;
        my.pos.x = target.x;
        my.pos.y = target.y;
    
        redis.setPlayer(my.id,my).then(data => {
            socket._sendMap(my.id,-86);
            if(my.detu && my.detu.id && my.detu.info && my.detu.info.trangthai != 'venha') socket._sendMap(my.detu.id,-86); 
        
            socket.send({
                _1 : target.map,
                _2 : my.pos
            }, -443);
        });
      
    }

    

}