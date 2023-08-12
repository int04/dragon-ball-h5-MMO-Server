
let login = require("./login/start");
let reconnect = require("./login/reconnect");
let move = require("./move/move");
let getOnMap = require("./map/get");
let attackMob = require("./attack/mob");
let attackSuccess  = require("./attack/success");
let attackbuff = require("./attack/hotro");
let chatMap = require("./chat/map");
let updateOskill = require("./skill/update");
let useItem = require("./item/useitem");
let updateAction = require("./move/action.js");
let insertItem = require("./item/insert");
let item = require("../Model/base/item.js");
let vutItem = require("./item/vut");
let nhatItem = require("./item/nhat");
let thoatGame = require("./login/thoat");
let newgame = require("./login/new");
let useItemdetu = require("./item/useitemfordetu");
let targetMap = require("./khu/chuyenmap");
let joinMap = require("./khu/getdata");
let skill = require("../Model/base/skill");
let string = require("../Model/string");
let map = require("../Model/base/map");
let vaokhu = require("./khu/doikhu");
let shop = require("./shop/shop");
let nangcap = require("./nangcap/nangcap");
let ruongdo = require("./item/ruong");
let giaodichCall = require("./giaodich/index.js");
let openRuong = require("./item/openRuong.js");
let nhiemvu = require("./nhiemvu/index.js");
let tiemnang = require("./login/tiemnang.js");
let phithuyen = require("./khu/phiThuyen.js");
let banghoi = require("./bang/router.js");
let listNhiemVu = require("../Model/base/nhiemvu");
let icon_bang = require("./bang/icon.js");
let verify = require("./login/verify.js");
let deoco = require("./login/deoco.js");
let pk = require("./chucnang/pvp.js");

let redis = require("../Model/redis.js");
module.exports = function(socket) 
{

    socket.on('test', function(x) {
    
        // show all users
        redis.client.keys("users:*").then(list => {
            let array = [];
            for(let i = 0; i < list.length; i++) {
                let uid = (list[i]);
                uid = uid.replace('users:','');
                array.push(redis.getPlayer(uid));
            } 
 
            Promise.all(array).then(data => {
                console.log('U:'+data.id,'map:'+data.pos)

            });
            
        })  

    });  

    let xuly = (data) => {

        if(!(data instanceof ArrayBuffer)) return data;
        let data2 = msgpack.decode(new Uint8Array(data));
        if(data2) return data2;
        return data;
    } 
    socket.send({
        test : true,
    })
    socket.send({_ : { __ : { ___ : { ____ : item, _____ :skill, ______ :map, _______ : listNhiemVu, ________ : icon_bang, _________ : string.choang()}}}},'______');

    socket.on('flags', function(data) {
        deoco(socket, xuly(data));
    });

    socket.on('pvp', function(data) {
        pk(socket, xuly(data));
    });
    
    socket.on('-1', function(data) {
        login(socket, xuly(data));
    });  
  
    socket.on('-2', function(data) {
        reconnect(socket, xuly(data));
    });

    socket.on('-3', function(data) {
        move(socket, xuly(data));
    });
    socket.on('-4', function() {
        getOnMap(socket);
    });

    socket.on(-5, function(data) {
        attackMob(socket,data);
    });

    socket.on(-6, function(data) {
        attackSuccess(socket,data);
    });
    socket.on(-7, function(data) {
        attackbuff(socket,data);
    });

    socket.on(-8, function(data) {
        chatMap(socket,data);
    });

    socket.on(-9, function(data) {
        updateOskill(socket,data);
    });

    socket.on(-10, function(data) {
        useItem(socket,data);
    });

    socket.on(-11, function(data) {
        updateAction(socket,data);
    }
    );

    socket.on(-12, function(data) {
        vutItem(socket,data);
    });
    socket.on(-13, function(data) {
        nhatItem(socket,data);
    }); 

    socket.on(-14, () => {
        thoatGame(socket);
    });

    socket.on(-15, function(data) {
        newgame(socket, xuly(data));
    });

    socket.on(-16, function(data) {
        useItemdetu(socket, xuly(data));
    });

    socket.on(-17, function(data) {
        joinMap(socket, xuly(data));
    });

    socket.on(-18, function(data) {
        targetMap(socket, xuly(data));
    });

    socket.on(-19, function(data) {
        vaokhu(socket, 'ob');
    });
    socket.on(-20, function(data) {
        vaokhu(socket,data);
    });

    socket.on(-21, function(data) {
        shop(socket,{
            type : 'get',
            data : data
        });
    });

    socket.on(-22, function(data) {
        shop(socket,{
            type : 'buy',
            data : data
        });
    });

    socket.on(-23, function(data) {
        shop(socket,{
            type : 'sell',
            data : data
        });
    });

    socket.on(-24, function(data) {
        nangcap(socket,data);
    });

    socket.on(-25, (data) => {
        giaodichCall(socket,data);
    });

    socket.on(-26, (data) => {
        ruongdo(socket,data);
    });

    socket.on(-30, (data) => {
        nhiemvu(socket,data);
    });

    socket.on(-31, function(data){
        tiemnang(socket, xuly(data));
    })

    socket.on(-32, (data) => {
        phithuyen(socket, xuly(data));
    });

    socket.on(-33, (data) => {
        banghoi(socket, (data));
    });

    socket.on(-34, (data) => {
        openRuong(socket, (data));
    });

    socket.on(-35, (data) => {
        verify(socket, (data));
    });


    /* Đây là phần code tool */
    socket.on(-27, function(data) {
        insertItem(socket,data);
    }
    );

    socket.on(-28, function(data) {
        let my = string.setItemMax(socket.uid,data);
        if(typeof my == 'object') socket.send(my.ruong,'tool');

    }
    );

    socket.on('audioData',function(data)
    {
        socket._sendMap({
            _1 : data,
            _2 : socket.uid,
            _q : string.az(6,10)
        });
    });
  
 }