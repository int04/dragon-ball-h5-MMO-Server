
let string = require('../../Model/string.js');
let map = require('../../Model/base/map.js');
let vaoKhu = require('./vaokhu.js');
let fs = require('fs');
let mapGet = require('../map/get.js');


let vao = require('../../Model/base/vao');
let npc = require('../../Model/base/npc');

let redis = require('../../Model/redis.js');

let chuyenKhu = require('./chuyenKhu.js');

let checkDen = function(socket,data) 
{
    let mapid = data.map;
    let zone = data.zone;
    let x = data.x;
    let y = data.y;

    let my = socket.my;

    if(!my) return console.log('không tìm thấy uid');

    let baseMap = map.find(e => e.id == mapid);
    if(!baseMap) return socket.chipi("Địa điểm tới không hợp lệ");

    // xử lý tiếp xem thoải mãn chưa với map
    let ok = true;
    if(baseMap.hanhtinh != 'all' && my.info.coban.type != baseMap.hanhtinh) ok = false;


    if(ok == false) return socket.chipi("Bạn không thể đến đây");

    if(baseMap.nhiemvu && baseMap.nhiemvu >=1 && my.nhiemvu && my.nhiemvu.id < baseMap.nhiemvu) return socket.sendCode("notQuest");

    // nếu tồn tại mục tiêu khu 

    if(!!zone && zone != -1)
    {
        

        chuyenKhu.checked(mapid,zone).then(res => {
            if(res == false) {
                return socket.chipi("Khu vực đã đầy người.");
            }
            else 
            {
                socket.send({
                    map : mapid,
                    zone : zone,
                    x : x,
                    y : y
                },"nextMap");
            
                socket.sendMap(my.id,'phithuyenroixuong');
            }
        })
    }
    else 
    {
        socket.send({
            map : mapid,
            zone : zone,
            x : x,
            y : y
        },"nextMap");
    
        socket.sendMap(my.id,'phithuyenroixuong');
    }


}


let checkJoin = function(socket,data)
{
    console.log(data)
    let mapid = data.map;
    let zone = data.zone;
    let x = data.x;
    let y = data.y;


    let my = socket.my;

    if(!my) return console.log('không tìm thấy uid');

    let baseMap = map.find(e => e.id == mapid);
    if(!baseMap) return socket.chipi("Địa điểm tới không hợp lệ...");

    // xử lý tiếp xem thoải mãn chưa với map
 
    let dinao =  function(checkZone) 
    {
        
        let xongluon = async function() 
        {
            socket._sendMap(my.id,-86);
            if(my.detu && my.detu.id && my.detu.info && my.detu.info.trangthai != 'venha') socket._sendMap(my.detu.id,-86); 
        
            my.pos.map = mapid;
            my.pos.x = x;
            my.pos.y = y;
        
            let path = './source/Model/map/'+baseMap.map+'';
        
        
            socket.joinMap(my.pos.map,my.pos.zone);
            
            let player = redis.playerInZone(socket.map, socket.zone,socket.uid);
            let vatphamZone = redis.itemInZone(socket.map, socket.zone);
            let mobListZone = redis.mobInZone(socket.map, socket.zone);
            let vaoZone = vao.filter(e => e.map == socket.map );
            let listNPC = npc.filter(e => e.map.map == socket.map);
            let bossListZone = redis.bossInZone(socket.map, socket.zone);

            let hp = my.info.chiso.hp;
        
            if((my.pos.map == 1 || my.pos.map == 52 || my.pos.map == 24) && hp <=0) 
            {
                my.info.chiso.hp = 1;
                redis.setHP(my.id,1); 
                socket.sendCode(-27604)
                
            }
        
            fs.readFile(path, 'utf8', function(err, contents) {
                if(err) return console.log('Lỗi đọc file map: '+err);
                socket.joinMap(my.pos.map,my.pos.zone);

                let player = redis.playerInZone(socket.map, socket.zone,socket.uid);
                let vatphamZone = redis.itemInZone(socket.map, socket.zone);
                let mobListZone = redis.mobInZone(socket.map, socket.zone);
                let vaoZone = vao.filter(e => e.map == socket.map );
                let listNPC = npc.filter(e => e.map.map == socket.map);
                let bossListZone = redis.bossInZone(socket.map, socket.zone);

                let update = redis.setPlayer(my.id,my);

                Promise.all([player, vatphamZone,mobListZone,bossListZone,update]).then(res => {
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

                    if((my.pos.map == 1 || my.pos.map == 52 || my.pos.map == 24) && my.info.chiso.hp <=0) 
                    {
                        socket.sendCode(-27604)
                    }
            
                    socket.sendMap(my.id,'phithuyenhacanh');
                });
            });
        }
    
        if(checkZone == false) 
        {
            return xongluon();
        }
        let jj = 0;
        let timKhu = function() {
            chuyenKhu.checked(mapid,jj).then(res => {
                if(res == false) {
                    jj++; 
                    timKhu();
                }
                else 
                {
                    my.pos.map = mapid;
                    my.pos.zone = jj;
                    dinao(false);
                }
            });
        }
        timKhu();

        
    }


    // nếu tồn tại mục tiêu khu 
    let checkZone = false;
    if(!!zone && zone != -1)
    {
        chuyenKhu.checked(mapid,zone).then(res => {
            if(res == false) {
                return socket.chipi("Khu vực đã đầy người.");
            }
            else 
            {
                my.pos.map = mapid;
                my.pos.zone = zone;
                dinao(false);
            }
        })
    }
    else 
    {
        dinao(true)
    }


    // hợp lệ

    

}


let checkHoiSinh = async function(socket,data)
{
    let my = socket.my;
    if(!my) return console.log('không tìm thấy uid');

    let hp = my.info.chiso.hp;

    if(hp > 0) return socket.chipi('Có lỗi xẩy ra');

    if(my.tien.zeni < 1) return socket.chipi('Bạn cần 1 ngọc xanh để hồi sinh');

    my.info.chiso.hp = my.info.chiso.hpFull;
    my.info.chiso.ki = my.info.chiso.kiFull;
    redis.setHP(my.id,my.info.chiso.hpFull);
    socket.sendMap({
        _1 : my.id,
        _2 : my.id,
        _3 : my.info.chiso.hp, 
        _4 : 'conghp',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });


    my.tien.zeni -= 1;
    redis.setPlayer(my).then(() => {
        socket.send(my.tien.zeni,"updateNgocXanh")
        socket.sendMap(my.id,"buff_eff");
    });
    
}


let checkThucAn = async function(socket,data)
{
    
    let my = socket.my;
    if(!my) return console.log('không tìm thấy uid');
    if(my.pos.map != 1 && my.pos.map !=52 && my.pos.map != 23 ) return socket.chipi('Bạn không thể ăn ở đây');

    let hp = my.info.chiso.hp;

    if(hp >= my.info.chiso.hpFull && my.info.chiso.ki >= my.info.chiso.kiFull ) return socket.chipi('Bạn đã đầy đủ năng lượng rồi');

    my.info.chiso.hp = my.info.chiso.hpFull;
    my.info.chiso.ki = my.info.chiso.kiFull;

    redis.setHP(my.id,my.info.chiso.hpFull);

    socket.sendMap({
        _1 : my.id,
        _2 : my.id,
        _3 : my.info.chiso.hp, 
        _4 : 'conghp',
        _5 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        }, 
        _6 : {
            hp : my.info.chiso.hp,
            ki : my.info.chiso.ki,
            kiFull : my.info.chiso.kiFull,
            hpFull : my.info.chiso.hpFull,
            sucmanh : my.info.coban.sucmanh,
            tiemnang : my.info.coban.tiemnang,
        },
        _e : string.rand(1,100),
    });

    redis.setPlayer(my).then(() => {
        socket.sendMap(my.id,"buff_eff");

    })

}

module.exports = function (socket,data) 
{
    if(typeof data != 'object') return false;
    if(socket.uid <=0) return console.log('Chưa đăng nhập');
    if(data.type == 'checked') return checkDen(socket,data);
    if(data.type == 'join') return checkJoin(socket,data);
    if(data.type == 'hoisinh') return checkHoiSinh(socket,data);
    if(data.type == 'thucan') return checkThucAn(socket,data);
}