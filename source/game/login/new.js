
let string = require('../../Model/string.js');
let mysqli = require('../../Model/mysqli');
let validator = require('validator');
let md5 = require('md5');

module.exports = function(client,data) 
{
    let server = 1;
    if(client.uid >=1) return false;
    if(typeof data != 'object') return false;
    let tenNhanVat = data._1;
    let hanhTinh = data._2;
    let nhanVat = data._3;
    hanhTinh = hanhTinh >> 0;
    nhanVat = nhanVat >> 0;
    if(!tenNhanVat || !hanhTinh || !nhanVat) return false;
    tenNhanVat = validator.escape(tenNhanVat);
    // tolow string
    tenNhanVat = tenNhanVat.toLowerCase();
    // check A-ZAz0-9
    if(!validator.isAlphanumeric(tenNhanVat)) return client.sendCode(-810);
    if(tenNhanVat.length <4 || tenNhanVat.length >12) return client.sendCode(-810);
    if(hanhTinh <1 || hanhTinh >3) return client.sendCode(-850);
    if(nhanVat <1 || nhanVat >3) return client.sendCode(-840);

    mysqli.query("SELECT `id` FROM `nhanvat` WHERE `name` = ? LIMIT 1",[tenNhanVat],function(err,rows_){
        if(err) throw err;
        if(rows_.length >=1) return client.sendCode(-830);

        let username = "new"+string.az(10);
        let password = string.az(10);
        let veri = 0;
        

        let createPlayer = function(uid) {
            let my = {};
            my  = {};
            my.info = {};
            my.info.coban = {};
            my.info.chiso = {};
            
            // insert to table nhanvat
            mysqli.query("INSERT INTO `nhanvat` (`uid`,`server`,`name`) VALUES ('"+uid+"','"+server+"','"+tenNhanVat+"')",function(err,rows2){

                // xử lý thêm thông tin
                let avatar = [
                    [],
                    [0,734,519,518], // gohan, kirin, yamcha
                    [0,520,521,522], // vegeta, calic, kakarot
                    [0,523,525,524], // picolo, kemi, octiu
                ];
                let skin_dau = [
                    [],
                    ["","qpLIHbmNrG","sLeNYzwVYi","QbPhVhGmRc"], // gohan, kirin, yamcha
                    ["","XnPloWDTdg","gNiPLfNjlC", "LivLKpGKlE"], // vegete, calic, kakarot
                    ["","BJokIHnCbz","lMzpmFtgCj","OxvZczuNNT"] // picolo, kemi, octiu
                ];
                let info_he = ['','traidat','saiyan','namek'];

                my.info.coban.type = info_he[hanhTinh];
                my = string.info(my)

                my.info.coban.avatar = avatar[hanhTinh][nhanVat];
                my.skin.dau = skin_dau[hanhTinh][nhanVat];

                let he = my.info.coban.type; 

                let skinOld = {
                    traidat : {ao : "ShKDzlJEkr", quan : "VwUvuLvFKR"},
                    namek : {ao : "VqyVqCVEwt", quan : "DVlmZNfDhj"},
                    saiyan : {ao : "QIysZgQBGv", quan : "QHUNKiBNGE"},
                }
                my.skin.ao = skinOld[he].ao;
                my.skin.quan = skinOld[he].quan;


                if(my.info.coban.type == 'traidat')
                {
                    my.info.chiso.hpGoc = 200;
                    my.info.chiso.kiGoc = 200;
                    my.info.chiso.sucdanhGoc = 10;
                    my.info.chiso.giapGoc = 0;
                    my.info.chiso.chimangGoc = 1;
                }

                if(my.info.coban.type == 'saiyan')
                {
                    my.info.chiso.hpGoc = 200;
                    my.info.chiso.kiGoc = 150;
                    my.info.chiso.sucdanhGoc = 15;
                    my.info.chiso.giapGoc = 0;
                    my.info.chiso.chimangGoc = 1;
                }

                if(my.info.coban.type == 'namek')
                {
                    my.info.chiso.hpGoc = 200;
                    my.info.chiso.kiGoc = 150;
                    my.info.chiso.sucdanhGoc = 15;
                    my.info.chiso.giapGoc = 0;
                    my.info.chiso.chimangGoc = 1;
                }
                
                my.info.chiso.hp = my.info.chiso.hpGoc;
                my.info.chiso.ki = my.info.chiso.kiGoc;
                my.info.chiso.sucdanh = my.info.chiso.sucdanhGoc;
                my.info.chiso.giap = my.info.chiso.giapGoc;
                my.info.chiso.chimang = my.info.chiso.chimangGoc;
                my.info.chiso.hpFull = my.info.chiso.hpGoc;
                my.info.chiso.kiFull = my.info.chiso.kiGoc;

                let start = {
                    traidat : {x : 785, y : -42, map : 1, zone : 0},
                    namek : {x : 1184, y : -42, map : 24, zone  : 0},
                    saiyan : {x : 352, y : -42, map : 52, zone : 0},
                };

                my.pos = start[he];

                client.send({
                    _1 : username,
                    _2 : password,
                }, -820)

                // save lại
                my.info.coban.khoidau = nhanVat;
                my.id = rows2.insertId;
                my = string.info(my);
                string.update(my);                

            });
        }

        if(client.nhanvat == false && client.username && client.password && client.nick >=1) {
            username = client.username;
            password = client.password;
            veri = 1;
            return createPlayer(client.nick);
        }


        let token = string.az(30);
        mysqli.query("INSERT INTO `nick` (`username`,`password`,`token`,`veri`) VALUES ('"+username+"','"+md5(password)+"','"+token+"',"+veri+")",function(err,rows){
            if(err) throw err;
            let uid = rows.insertId;
            return createPlayer (uid);

        });

    });



}