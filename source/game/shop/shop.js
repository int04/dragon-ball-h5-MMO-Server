let item = require('../../Model/base/item.js');
let catlog = require('./catlog.js');
let data_shop = require('./data_shop.js');
let string = require('../../Model/string.js');

let redis = require('../../Model/redis.js');

let getDataShop = function(socket,data)
{
    if(socket.uid <= 0) return console.log('Chưa login');
    let my = socket.my;
    if(!my) return console.log('Không tìm thấy uid');
    let idshop = data;
    if(!idshop) return console.log('Không tìm tháy id shop');
    let shop = catlog.find(e => e.id == idshop);
    if(!shop) return console.log('Không có sp nào');

    
    
    socket.send({
        _s : string.az(6,10),
        _1 : shop, 
        _2 : data_shop,
        _3 : my.tien,
        _4 : my.ruong,
        npc : shop.npc,
    })

}

let getDataBuy = function(socket,data)
{
    if(socket.uid <= 0) return console.log('Chưa login');
    if(socket.awaitBuy == true) return console.log('Đang chờ mua');
    socket.awaitBuy = true;
    
    let my = socket.my;

    if(!my) {
        socket.awaitBuy = false;
        return console.log('Không tìm thấy uid');
    }
    let idshop = data; // id shop
    let datashop = data_shop.find(e => e.idvp == idshop);
    if(!datashop) {
        socket.awaitBuy = false;
        return console.log('Không có sp nào trong shop');
    }
    let itembase = item.find(e => e.id == idshop);
    if(!itembase) {
        socket.awaitBuy = false;
        return console.log('Không có item nào trong cơ sở dữ liệu');
    }

    // check tiền 
    if(my.tien[datashop.type]*1 < datashop.buy*1) {
        socket.sendCode(1111);
        socket.awaitBuy = false;
        return console.log('Không đủ tiền');
    }

    // nếu là trang bị 
    if(itembase.type == "trangbi")
    {
        if(string.checkRuong(my) <=0) {
            socket.awaitBuy = false;
            return socket.sendCode(1311);
        }
        my.ruong.item.push({
            id : string.az(10),
            active : 'hanhtrang',
            info : itembase.info,
            item : itembase.id,
            soluong : 1, 
            khoa : itembase.khoa*1,
            level : 0,
            sao : 0,
            lastTime : Date.now(),
            saotrong : 0
        })
    }
    else // vật phẩm
    {
        let userVP = string.setItem(my.id, itembase.id,1,itembase,my); // id player, id item, data ITEM, data USERS
        if(userVP == 1) {
            socket.awaitBuy = false; 
            return console.log('không tìm thấy người chơi');
        }
        if(userVP == 2) {
            socket.awaitBuy = false;
            return console.log('không tìm thấy item');
        }
        if(userVP == 3) {
            socket.awaitBuy = false;
            return console.log('Không phải vật phẩm');
        }
        if(userVP == 4) {
            socket.awaitBuy = false;
            return socket.sendCode(1411); // mang tối đa trên hành trang
        }
        if(userVP == 5) {
            socket.awaitBuy = false;
            return socket.sendCode(1511); // max 99 vp
        }
        if(userVP == 6) {
            socket.awaitBuy = false;
            return socket.sendCode(1311); // hết chỗ để tạo mới
        }

        my = userVP;

    }
    socket.awaitBuy = false;


    my.tien[datashop.type] = my.tien[datashop.type]*1 - datashop.buy*1;

    redis.setPlayer(my).then(() => {
        socket.send({
            _s2 : string.az(6,10),
            _1 : my.ruong,
            _2 : my.tien,
        });
    });


}

let getDataSell = function(socket,data)
{
    let idbag = data;
    if(!idbag) return console.log('Không có idbag');
    if(socket.uid <= 0) return console.log('Chưa login');
    if(socket.awaitSell == true) return console.log('Đang chờ bán');
    socket.awaitSell = true;

    let my = socket.my;

    if(!my) {
        socket.awaitSell = false;
        return console.log('Không tìm thấy uid');
    }
    let itembag = my.ruong.item.find(e => e.id == idbag);
    let itembase = item.find(e => e.id == itembag.item);
    if(!itembag) {
        socket.awaitSell = false;
        return console.log('Không có itembag');
    }
    if(!itembase) {
        socket.awaitSell = false;
        return console.log('Không có itembase');
    }
    let datashop = data_shop.find(e => e.idvp == itembase.id);

    if(itembag.active != 'hanhtrang') {
        socket.awaitSell = false;
        return console.log('Item này ko thể bán');
    }
    if(!datashop) {
        socket.awaitSell = false;
        return console.log('Không có item này trong shop');
    }
    if(datashop.sell == -1) {
        socket.awaitSell = false;
        return console.log('Item này ko thể bán');
    }

    socket.awaitSell = false;
    let cost = datashop.sell || 1;
    cost = cost < 1 ? 1 : cost;
    let tiennhan = cost*itembag.soluong;

    my.tien.vang = my.tien.vang*1 + tiennhan*1;
    my.ruong.item = my.ruong.item.filter(e => e.id != idbag);


    redis.setPlayer(my).then(() => {
        socket.send({
            _s2 : string.az(6,10),
            _1 : my.ruong,
            _2 : my.tien,
            _3 : tiennhan,
        });
    });





}

module.exports  = function(socket,data)
{
    if(data.type == 'get') getDataShop(socket,data.data);
    if(data.type == 'buy') getDataBuy(socket,data.data);
    if(data.type == 'sell') getDataSell(socket,data.data);
}