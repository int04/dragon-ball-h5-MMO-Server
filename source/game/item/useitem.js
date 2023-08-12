
let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');
let sachvo = require('./useitem/sachvo.js');

let redis = require('../../Model/redis.js');

module.exports = function(socket,data)
{
    try {

        let id = data; 
        if(!id) return console.log('Không thấy id vp');
        if(socket.uid <=0) return console.log('Chưa đăng nhập');
    
        if(socket.awaitUsedItem == true) return console.log('Await used item');
        socket.awaitUsedItem = true;
        
        let my = socket.my;

        if(!my) return console.log('Không tìm thấy người dùng');
        let myItem = my.ruong.item.find(e=>e.id == id  );
        if(!myItem) {
            socket.awaitUsedItem = false;
            socket.sendCode(6);
            return false;
        }

        if(myItem.active =='ruong') {
            socket.awaitUsedItem = false;
            return socket.noti('Vui lòng lấy món đồ ra khỏi rương trước khi sử dụng');
        }

        let infoItem = item.find(e=>e.id == myItem.item); // lấy thông tin item trong cơ sở dữ liệu
        if(!infoItem) {
            socket.awaitUsedItem = false;
            console.log('Không tìm thấy VP trong cơ sở dữ liệu');
            socket.sendCode(6);
            return false;
        }

        if(infoItem.type != "trangbi" && myItem.soluong <=0)
        {
            socket.awaitUsedItem = false;
            console.log('Đây là item, và bạn đã hết VP');
            my.ruong.item = my.ruong.item.filter(e=>e.id != id);
            socket.sendCode(6);
            return false;
        }

        if(infoItem.type == 'trangbi') // nếu là vật phẩm trang bị
        {
            console.log(infoItem.sucmanh)
            console.log("====")
            if(infoItem.sucmanh && infoItem.sucmanh > my.info.coban.sucmanh) 
            {
                socket.awaitUsedItem = false;
                socket.sendCode(7)
                return console.log('Chưa đủ sm')
            }

            /* Nếu item đang chọn đang mặc thì tiến hành tháo ra. */
            if(myItem.active == 'trangbi' && myItem.id == my.trangbi[infoItem.type2] ) 
            {
                /* Xem còn ô trống để tháo ra không */
                if(string.checkRuong(my) <=0) {
                    socket.awaitUsedItem = false;
                    return socket.sendCode(1211);
                }
                myItem.active = 'hanhtrang';
                myItem.lastTime = Date.now();
                if(infoItem.type2) my.trangbi[infoItem.type2] = 0;
            }
            else 
            /* Nếu trang bị đang chuẩn bị mặc ở trạng thái hành trang */
            if(myItem.active == 'hanhtrang') 
            {
                /* Nếu đang mặc sẵn 1 trang bị, tháo trang bị đó ra trước */
                if(infoItem.type2 && my.trangbi[infoItem.type2] != 0) {
                    let oldItem = my.ruong.item.find(e=>e.id == my.trangbi[infoItem.type2]);
                    if(oldItem) {
                        oldItem.active = 'hanhtrang';
                        oldItem.lastTime = Date.now();
                    }
                }

                myItem.active = 'trangbi';
                myItem.lastTime = Date.now();
                if(infoItem.type2) my.trangbi[infoItem.type2] = myItem.id;
            } 
    
            my =  string.updatePlayer(my,socket);
            redis.setPlayer(my).then(resolve => {
                socket.awaitUsedItem = false;
                socket.send({
                    _i : string.rand(1,100),
                    _1 : my.ruong, 
                    _2 : my.trangbi,
                })
            });
        }

        if(infoItem.type == 'item')
        {
            if(infoItem.type2 == 'sachvo') {
                return sachvo(socket,my,infoItem);
            }
            socket.sendCode(6);
            socket.awaitUsedItem = false;
        }


        socket.awaitUsedItem = false;

        


    }
    catch(e) 
    {
        console.log(e)
    }
}