
let string = require('../../Model/string.js');
let map = require('../../Model/base/map.js');
let fs = require('fs');
let vaoKhu = require('./vaokhu.js');

let mapGet = require('../map/get.js');

let vao = require('../../Model/base/vao');
let npc = require('../../Model/base/npc');

let chuyenKhu = require('./chuyenKhu.js');

let redis = require('../../Model/redis.js');

module.exports = function(socket,data)
{
    if(socket.uid <=0) return false; 

    let my = socket.my;
    if(my) 
    {
        if(!my) return console.log('không tìm thấy uid');
        let idmap = !!data ? data :  my.pos.map;
        let baseMap = map.find(e => e.id == idmap);
        if(!baseMap) return console.log('Bản đồ không tồn tại');
    
        let path = './source/Model/map/'+baseMap.map+'';
    
        fs.readFile(path, 'utf8', function(err, contents) {
            if(err) return console.log('Lỗi đọc file map: '+err);
    
            my.pos.map = idmap;
            let khu = 0;
    
            let call = function() {
                chuyenKhu.inLog(my.pos.map,khu,socket).then(data => {
    
                    if(data) 
                    {
                        my.pos.zone = khu;
                        socket.map = my.pos.map;
                        socket.zone = my.pos.zone;
    
    
                        let playerGet = redis.playerInZone(socket.map, socket.zone,socket.uid);
                        let vatphamZone = redis.itemInZone(socket.map, socket.zone);
                        let vaoZone = vao.filter(e => e.map == socket.map );
                        let listNPC = npc.filter(e => e.map.map == socket.map);
                        let mobListZone = redis.mobInZone(socket.map, socket.zone);
                        let bossListZone = redis.bossInZone(socket.map, socket.zone);

                         
                        let setPlayer = redis.setPlayer(my.id,my);
                        Promise.all([playerGet,vatphamZone,mobListZone,bossListZone, setPlayer]).then(data => {
                            socket.send({
                                _p : string.az(5),
                                _1 : contents,
                                _2 : my.pos.map,
                                _3 : my.pos.zone,
                                _4 : baseMap.color,
                                _5 : baseMap.background,
                                _6 : baseMap.more,
                                _7 : {
                                    _1: data[0],
                                    _2: data[2],
                                    _3: data[1],
                                    _4 : vaoZone,
                                    _5 : listNPC,
                                    _6 : data[3],
                                },
                            }); 
                            if(socket.firtLogin == undefined) {
                                socket.firtLogin = true;
                                string.updatePlayer(my,socket)
                            }
                        });
    
                
                        string.update(my);
                    }
                    else 
                    {
                        khu++;
                        call();
                    }
                });
            }
    
            call();
    
    
            
    
    
    
    
    
            
    
        });
    
    }

    
}