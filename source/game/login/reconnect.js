let mysqli = require('../../Model/mysqli');
let validator = require('validator');
let vaoKhu = require('../khu/vaokhu');
let string = require('../../Model/string');
let md5 = require('md5');
let me = require('../bang/me.js');

let redis = require('../../Model/redis.js');

let getObject = require('../map/get.js');
function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}


let chuyenKhu = require('../khu/chuyenKhu.js');

let getNhanVat = (id) => {
    return new Promise((res,fai) => {
        mysqli.query("SELECT * FROM `nhanvat` WHERE `id` = ? LIMIT 1",[id],function(err,rows){ 
            if(rows.length > 0) {
                res(rows[0]);
            }
            else {
                res(null);
            }
        });
    });
}

let getNickACc = (id, token) => {
    return new Promise((res,fai) => {
        mysqli.query("SELECT * FROM `nick` WHERE `id` = ? AND `token` = ? LIMIT 1",[id, token],function(err,rows){ 
            if(rows.length > 0) {
                res(rows[0]);
            }
            else {
                res(null);
            }
        });
    })
}
 

module.exports = async function(client,data) 
{
    let socket = client;
    if(client.awaitReconnect == true) return false;
    client.awaitReconnect = true;
    if(typeof data != "object") return client.awaitReconnect = false;
    if(!data._1 || !data._2) return client.awaitReconnect = false;
    let id = (data._1);
    let token = data._2;
    client.nhanvat = false;

    let checkNV = await getNhanVat(id);
    if(checkNV == null) {
        client.awaitReconnect = false;
        return client.sendCode(-97);
    }

    let checkOnline = await redis.getPlayer(checkNV.id);
    if(checkOnline) {
        socket.awaitReconnect = false;
        process.send({
            since04 : {
                uid : checkOnline.id,
                type : 'out',
            }
        })
        return socket.sendCode(-1306);
    }

    let getNick = await getNickACc(checkNV.uid,token);
    if(!getNick) {
        client.awaitReconnect = false;
        return client.sendCode(-98);
    }

    client.awaitReconnect = false;


    client.nhanvat = true;
    let nhanVat = checkNV;
    let my = {};
    my.id = nhanVat.id;
    my.type = 'player';
    my.username = getNick.username;
    my.veri = getNick.veri;
    client.veri = my.veri;
    my.server = nhanVat.server;
    my.name = nhanVat.name;
    my.tien = JSON.parse(nhanVat.tien);
    my.used = JSON.parse(nhanVat.used);
    my.eff = JSON.parse(nhanVat.eff);
    my.skin = JSON.parse(nhanVat.skin);
    my.trangbi = JSON.parse(nhanVat.trangbi);
    my.ruong = JSON.parse(nhanVat.ruong);
    my.skill = JSON.parse(nhanVat.skill);
    my.oskill = JSON.parse(nhanVat.oskill);
    my.info = JSON.parse(nhanVat.info);
    my.pos = JSON.parse(nhanVat.pos);
    my.detu = JSON.parse(nhanVat.detu);
    if(isJSON(nhanVat.nhiemvu)) my.nhiemvu = JSON.parse(nhanVat.nhiemvu);


    client.uid = my.id;
    client.leaveMap();
    client.join("game");
    client.joinMap(my.pos.map,my.pos.zone);
    my.socket = client.id;


    my  = string.info(my); // kiểm tra các dữ liệu căn bản
    let khu = my.pos.zone;
    let tim = true;
    socket.uid = my.id;
    socket.join("game");

    socket.my = my;


    let timKhu = function() {
        chuyenKhu.inLog(my.pos.map,khu,socket).then(data => {
            console.log(data)
            if(data == true) {
                my.pos.zone = khu;
                
                my.socket = socket.id;

                my = string.updatePlayer(my);
                if(my.skin.bangID >=1) {
                    socket.joinPT();
                    me(socket,{}); // send bang info
                }

                redis.setPlayer(my.id,my).then(data => {
                    console.log(data)
                    getObject(client); 
                    client.sendCode(-100)
                })

                if(!player.find(e => e.id == my.id)) {
                    player.push(my);
                }
            }
            else {
                khu++;
                timKhu();
            }
        });
    }
    timKhu();



    string.log(my.id,'reconnect')


}