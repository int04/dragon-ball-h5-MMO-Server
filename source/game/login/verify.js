let mysqli = require('../../Model/mysqli');
let validator = require('validator');
let vaoKhu = require('../khu/vaokhu');
let string = require('../../Model/string');
let md5 = require('md5');
let redis = require('../../Model/redis');
module.exports = function(socket,data) 
{
    if(socket.uid <=0) return socket.noti('Có lỗi xẩy ra');

    if(typeof data == "object" &&  data._1 && data._2) 
    {

        let username = validator.escape(data._1);
        let password = validator.escape(data._2);
        // check A-ZAz0-9
        if(!validator.isAlphanumeric(username)) return socket.since04({notice:{title:'ĐĂNG NHẬP',text:'Tên đăng nhập không hợp lệ...'}});
        if(!validator.isAlphanumeric(password)) return socket.since04({notice:{title:'ĐĂNG NHẬP',text:'Mật khẩu không hợp lệ...'}});
        
        if(socket.veri == 1) return socket.noti('Nhân vật đã được liên kết tài khoản rồi.');

        redis.getPlayer(socket.uid).then(my => {
            if(!my) return socket.noti('Có lỗi xẩy ra tại cache. #1');

            mysqli.query("SELECT uid FROM `nhanvat` WHERE `id` = ?", [my.id], function(err,rows){
                if(err) return socket.noti('Có lỗi xẩy ra tại truy vấn. #2');
                if(rows.length <=0) return socket.noti('Không tìm thấy nhân vật trong bộ nhớ. #2');
                let nhanVat = rows[0];
                let uid = nhanVat.uid;
    
                mysqli.query("SELECT `id` FROM `nick` WHERE username = ? LIMIT 1",[username],function(err2,rows2){
                    if(err2) return socket.noti('Có lỗi xẩy ra tại kiểm tra tài khoản. #3'); 
                    if(rows2.length >=1) return socket.noti('Tên tài khoản đã được sử dụng cho một nhân vật khác');
                    mysqli.query("SELECT `id` FROM `nick` WHERE `id` = ? LIMIT 1",[uid],function(err3,rows3){
                        if(err3) return socket.noti('Có lỗi xẩy ra tại kiểm tra tài khoản của bạn. #4'); 
                        if(rows3.length <=0) return socket.noti('Không tìm thấy nhân vật trong bộ nhớ. #4');
                        mysqli.query("UPDATE `nick` SET `username` = ?, `password` = ?, `veri` = ? WHERE `id` = ?",[username,md5(password),1,uid],function(err4,rows4){
                            if(err4) {
                                console.log(err4)
                                return socket.noti('Có lỗi xẩy ra tại cập nhật tài khoản. #5'); 
                            }
                            socket.veri = 1;
                            socket.send({_1 : username, _2 : password},"successLK")
                            socket.noti('Liên kết tài khoản thành công');
                        });
                    });
                });
    
            });
        });

        
    }
    else 
    {
        socket.noti("Có lỗi xẩy ra");
    }

}