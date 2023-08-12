
let mysqli = require('../../Model/mysqli');
let validator = require('validator');
let vaoKhu = require('../khu/vaokhu');
let string = require('../../Model/string');
let md5 = require('md5');

let me = require('../bang/me.js');

let redis = require('../../Model/redis.js');

let chuyenKhu = require('../khu/chuyenKhu.js');

function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

let checkAccount = (username,password) => {
    return new Promise((res,fai) => {
        mysqli.query("SELECT * FROM `nick` WHERE `username` = ? AND `password` = ? LIMIT 1",[username,md5(password)],function(err,rows){
            if(rows.length > 0) {
                res(rows[0]);
            }
            else {
                res(null);
            }
        });
    });
}

let checkSprite = (uid) => {
    return new Promise((res,fai) => {
        mysqli.query("SELECT * FROM `nhanvat` WHERE `uid` = '"+uid+"' LIMIT 1",function(err,rows2){
            if(rows2.length > 0) {
                res(rows2[0]);
            }
            else {
                res(null);
            }
        });
    });
}

module.exports = async function(socket,data) 
{
    if(socket.uid >=1) return false;
    if(socket.awaitLogin == true) return false;
    socket.awaitLogin = true;
    if(typeof data == "object" &&  data._1 && data._2) 
    {
        let username = data._1;
        let password = data._2;

        let checkAcc = await checkAccount(username,password);
        if(checkAcc == null) {
            socket.awaitLogin = false;
            return socket.sendCode(-99);
        }
        let checkNv = await checkSprite(checkAcc.id);

        if(checkNv == null) {
            socket.awaitLogin = false;
            socket.nhanvat = false;
            socket.sendCode("noChar");
            console.log('Không có nv')
            return false;
        }
        
        let checkOnline = await redis.getPlayer(checkNv.id);
        if(checkOnline) {
            socket.awaitLogin = false;
            process.send({
                since04 : {
                    uid : checkOnline.id,
                    type : 'out',
                }
            })
            redis.delPlayer(checkOnline.id);
            return socket.sendCode(-1306);
        }

        socket.awaitLogin = false;

        socket.username = username;
        socket.nick = checkAcc.id;
        socket.password = password;
        socket.nhanvat = true;
        let nhanVat = checkNv;
        let my = {};
        my.id = nhanVat.id;
        string.log(my.id,'login');
        my.type = 'player';
        my.username = checkAcc.username;
        my.veri = checkAcc.veri;
        socket.veri = checkAcc.veri;
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
        my.skin.coPK = 0;
        if(isJSON(nhanVat.nhiemvu)) my.nhiemvu = JSON.parse(nhanVat.nhiemvu);
        my.detu = (my.detu);
        my.token = string.az(30);
        // update token to database nick
        mysqli.query("UPDATE `nick` SET `token` = '"+my.token+"' WHERE `id` = '"+checkAcc.id+"' LIMIT 1",function(err,rows){
            if(err) throw err;
        });

        my  = string.info(my); // kiểm tra các dữ liệu căn bản
        let khu = 0;
        let tim = true;
        socket.uid = my.id; 
        socket.my = my;
        // change map ID socket
        socket.join("game");
        my = string.updatePlayer(my,socket); 

        socket.sendIO({
            hello : true,
        })

        let timKhu = function() {
            chuyenKhu.inLog(my.pos.map,khu,socket).then(res => {
                if(res == true) {
                    my.pos.zone = khu;
                    
                    
                    my.socket = socket.id;

                    if(my.skin.bangID >=1) {
                        socket.joinPT();
                        me(socket,{}); // send bang info
                    }

                    redis.setPlayer(my.id,my).then(res2 => {
                        socket.since04({
                            login : {
                                status : true, 
                                my : my,
                            },
                            closeNotice : true,
                        })
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

    
        
    }
}