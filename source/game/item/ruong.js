
let string = require("../../Model/string.js");

let item = require("../../Model/base/item.js");

let redis = require("../../Model/redis.js");

let layra = function(socket,data)
{
    let id = data._2;
    if(!id) return false;

    if(socket.uid <=0) return false;
    if(socket.awaitLayra == true) return console.log('Await layra');
    socket.awaitLayra = true;
    

    let my = socket.my;

    let myItem = my.ruong.item.find(e=>e.id == id);

    if(!myItem) {
        socket.awaitLayra = false;
        return socket.chipi("Không thể tìm thấy vật phẩm này.");
    }

    let dadung = my.ruong.item.filter(e => e.active == 'hanhtrang');
    let max = my.ruong.slot;
    let controng = max - dadung.length;

    if(myItem.active != 'ruong') {
        socket.awaitLayra = false;
        return socket.chipi("Vật phẩm này không nằm trong rương đồ của bạn.");
    }

    let infoItem = item.find(e=>e.id == myItem.item);

    if(!infoItem) {
        socket.awaitLayra = false;
        return socket.chipi("Không đọc được vật phẩm trong cơ sở dữ liệu.");
    }

    if(infoItem.type == 'trangbi') 
    {
        if(controng <=0) 
        {
            socket.awaitLayra = false;
            socket.chipi("Hành trang của bạn không có đủ chỗ trống để thực hiện.");
            return false;
        }
        myItem.active = 'hanhtrang';
        myItem.lastTime = Date.now();
    }
    else 
    if(infoItem.type == 'item')
    {
        let tontai = my.ruong.item.find(e=>e.item == myItem.item && e.active == 'hanhtrang');
        if(tontai)
        {
            if(tontai.soluong+myItem.soluong >=99) return socket.chipi("Hành trang của bạn đã mang x99 vật phẩm này nên không thể mang thêm.");
            tontai.soluong += myItem.soluong;
            // delete myItem
            my.ruong.item = my.ruong.item.filter(e=>e.id != myItem.id);
        }
        else 
        {
            if(controng <=0) 
            {
                socket.awaitLayra = false;
                socket.chipi("Rương đồ của bạn đã đầy.");
                return false;
            }
            let max = 99;
            let soluong = myItem.soluong;
            if(soluong > max) soluong = max;
            myItem.soluong -= soluong;
            let newItem;
            newItem =  JSON.parse(JSON.stringify(myItem));
            newItem.soluong = soluong;
            newItem.active = 'hanhtrang';
            newItem.lastTime = Date.now();
            newItem.id = string.az(6,10);
            my.ruong.item.push(newItem);

            if(myItem.soluong <=0) my.ruong.item = my.ruong.item.filter(e=>e.id != myItem.id);
        }
    }

    redis.setPlayer(my).then(data => {
        socket.send({
            _1 : my.ruong,
        },'catdothanhcong');
        string.update(socket.uid);
        socket.awaitLayra = false;
    });

    
}

let catvao = function(socket,data)
{
    let id = data._2;
    if(!id) return false;

    if(socket.uid <=0) return false;

    if(socket.awaitCatVao == true) return console.log('await catvao');
    socket.awaitCatVao = true;
    
    let my = socket.my;

    let myItem = my.ruong.item.find(e=>e.id == id);

    if(!myItem) {
        socket.awaitCatVao = false;
        return socket.chipi("Không thể tìm thấy vật phẩm này.");
    }

    let dadung = my.ruong.item.filter(e => e.active == 'ruong');
    let max = my.ruong.ruong;
    let controng = max - dadung.length;

    if(myItem.active != 'hanhtrang') {
        socket.awaitCatVao = false;
        return socket.chipi("Bạn phải tháo vật phẩm ra hành trang trước khi muốn cất vào rương.");
    }

    let infoItem = item.find(e=>e.id == myItem.item);

    if(!infoItem) {
        socket.awaitCatVao = false;
        return socket.chipi("Không đọc được vật phẩm trong cơ sở dữ liệu.");
    }

    if(infoItem.type == 'trangbi') 
    {
        if(controng <=0) 
        {
            socket.chipi("Rương đồ của bạn đã đầy.");
            socket.awaitCatVao = false;
            return false;
        }
        myItem.active = 'ruong';
        myItem.lastTime = Date.now();
    }
    else 
    if(infoItem.type == 'item')
    {
        /* check xem đã có vp này trong rương chưa */
        let tontai = my.ruong.item.find(e=>e.item == myItem.item && e.active == 'ruong');
        if(tontai)
        {
            if(tontai.soluong+myItem.soluong >=99) {
                socket.awaitCatVao = false;
                return socket.chipi("Rương đồ đã có x99 vật phẩm này, không thể cất thêm.");
            }
            tontai.soluong += myItem.soluong;
            // delete myItem
            my.ruong.item = my.ruong.item.filter(e=>e.id != myItem.id);
        }
        else 
        {
            if(controng <=0) 
            {
                socket.awaitCatVao = false;
                socket.chipi("Rương đồ của bạn đã đầy.");
                return false;
            }
            let max = 99;
            let soluong = myItem.soluong;
            if(soluong > max) soluong = max;
            myItem.soluong -= soluong;
            
            // tạo object mới
            let newItem;
            newItem =  JSON.parse(JSON.stringify(myItem));
            newItem.soluong = soluong;
            newItem.active = 'ruong';
            newItem.lastTime = Date.now();
            newItem.id = string.az(6,10);
            my.ruong.item.push(newItem);

            if(myItem.soluong <=0) my.ruong.item = my.ruong.item.filter(e=>e.id != myItem.id);
        }
    }

    redis.setPlayer(my).then(data => {
        socket.awaitCatVao = false;
        string.update(socket.uid);
        socket.send({
            _1 : my.ruong,
        },'catdothanhcong');
    });

    


 

}

module.exports = function(socket,data)
{
    if(typeof data != 'object') return false;
    if(data._1 == 1) return catvao(socket,data);
    if(data._1 == 2) return layra(socket,data);

}