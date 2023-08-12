
let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');
let redis = require('../../Model/redis.js');
module.exports = function(socket,data)
{
    try {

        let id = data; 
        if(!id) return console.log('Không thấy id vp');
        if(socket.uid <=0) return console.log('Chưa đăng nhập');
        if(socket.awaitdetu == true) return console.log('Await detu');
        socket.awaitdetu = true;
    
        let my = socket.my;

        if(!my) {
            socket.awaitdetu = false;
            return console.log('Không tìm thấy người dùng');
        }
        let myItem = my.ruong.item.find(e=>e.id == id);
        if(!myItem) {
            socket.awaitdetu = false;
            socket.sendCode(6);
            return false;
        }

        if(myItem.active =='ruong') {
            socket.awaitdetu = false;
            return socket.noti('Vui lòng lấy món đồ ra khỏi rương trước khi sử dụng');
        }

        if(!my.detu) {
            socket.awaitdetu = false;
            return console.log('Chưa đến đệ tử');
        }
        if(typeof my.detu != 'object') {
            socket.awaitdetu = false;
            return console.log('Đệ tử không phải là object');
        }

        let infoItem = item.find(e=>e.id == myItem.item); // lấy thông tin item trong cơ sở dữ liệu
        if(!infoItem) {
            socket.awaitdetu = false;
            console.log('Không tìm thấy VP trong cơ sở dữ liệu');
            socket.sendCode(6);
            return false;
        }

        if(infoItem.type != "trangbi" && myItem.soluong <=0)
        {
            socket.awaitdetu = false;
            console.log('Đây là item, và bạn đã hết VP');
            my.ruong.item = my.ruong.item.filter(e=>e.id != id);
            socket.sendCode(6);
            return false;
        }

        if(infoItem.type == 'trangbi') // nếu là vật phẩm trang bị
        {
            if(infoItem.sucmanh && infoItem.sucmanh > my.detu.info.coban.sucmanh) 
            {
                socket.awaitdetu = false;
                socket.sendCode(7)
                return console.log('Chưa đủ sm')
            }


            /* Nếu item đang chọn mà đã mặc cho đệ tử thì tháo nó ra. */
            if(myItem.active == 'detu' && myItem.id == my.detu.trangbi[infoItem.type2] ) 
            {
                /* kiểm tra xem rương đồ còn trống không. */
                if(string.checkRuong(my) <=0) {
                    socket.awaitdetu = false; 
                    return socket.sendCode(-96);
                }
                myItem.active = 'hanhtrang';
                myItem.lastTime = Date.now();
                if(infoItem.type2) my.detu.trangbi[infoItem.type2] = 0;
            }
            else 
            /* Nếu item đang nằm trong bag và giờ chuẩn bị mặc */
            if(myItem.active == 'hanhtrang') 
            {
                /* nếu đệ tử đang trang bị 1 món khác thì tháo nó ra trước */
                if(infoItem.type2 && my.detu.trangbi[infoItem.type2] != 0) {
                    let oldItem = my.ruong.item.find(e=>e.id == my.detu.trangbi[infoItem.type2]);
                    if(oldItem) {
                        oldItem.active = 'hanhtrang';
                        oldItem.lastTime = Date.now();
                    }
                }

                myItem.active = 'detu';
                myItem.lastTime = Date.now();
                if(infoItem.type2) my.detu.trangbi[infoItem.type2] = myItem.id;
            } 
            
            redis.setPlayer(my.id,my).then(res => {
                socket.awaitdetu = false;
                string.updatePlayer(my.id,socket);
                socket.send({
                    _o : string.rand(1,100),
                    _1 : my.ruong, 
                    _2 : my.detu.trangbi,
                    _3 : my.detu.info,
                })
            })
        }
        


    }
    catch(e) 
    {
        console.log(e)
    }
}