let string = require('../../Model/string.js');
let item = require('../../Model/base/item.js');
let redis = require('../../Model/redis.js');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = function(socket,data) {
    if(typeof data != 'object') return;
    let id = data.id;
    let i = data.i;
    if(!id) return;

    if(socket.awaitOpenRuong == true) return console.log('await Ruong');
    socket.awaitOpenRuong = true;

    redis.getPlayer(socket.uid).then(my => {
        if(!my) {
            socket.awaitOpenRuong = false;
            return false;
        }

        let slot = my.ruong.slot; 
        let all = my.ruong.item.filter(e => e.active == 'hanhtrang');
        let none = slot - all.length;
        if(none <=0) {
            socket.awaitOpenRuong = false;
            return socket.chipi("Hành trang phải còn trống ít nhất 1 ô mới có thể sử dụng");
        }
    
        let myItem = my.ruong.item.find(e => e.item == id && e.active == 'hanhtrang');
        if(!myItem) {
            socket.awaitOpenRuong = false;
            return socket.chipi("Bạn đã mở hết rương");
        }
    
        let itemData = item.find(e => e.id == id); // gọi biến data
        if(!itemData) {
            socket.awaitOpenRuong = false;
            return socket.chipi("Lỗi vật phẩm trong CSDL");
        }
    
        if(itemData.type != 'ruong') {
            socket.awaitOpenRuong = false;
            return socket.chipi("Rương này không thể mở");
        }
    
        // tiến hành xử lý
        let mang = [];  
        let j = 0;
        let listALL = itemData.list;
        let songaunhien = [];
        // nhập các IDVP vào mảng
        for(let key in listALL) {
            mang[j] = {
                id : j, 
                idvp : key,
                data : listALL[key]
            }
            for(let k = 0; k < listALL[key].tile; k++) {
                songaunhien.push(j);
                // đảo vị trí
                songaunhien = shuffleArray(songaunhien);
            }
            j++;
        }
    
        let random = string.rand(0,songaunhien.length-1);
        let phantuMang = songaunhien[random];
        let idVP = mang[phantuMang].idvp;
        let dataVP = item.find(e => e.id == idVP); // lấy vật phẩm trong CSDL xác định loại
        let itemInList = mang[phantuMang].data;    // lấy vật phẩm trong list xác định số lượng, hạn sử dụng
    
        if(!dataVP) {
            socket.awaitOpenRuong = false; 
            return socket.chipi("Lỗi vật phẩm trong CSDL. Bạn không bị mất vật phẩm");
        }
        if(!itemInList) {
            socket.awaitOpenRuong = false;
            return socket.chipi("Lỗi vật phẩm trong quá trình tạo rương. Bạn không bị mất vật phẩm");
        }
    
        if(dataVP.type == 'trangbi') 
        {
            let g; 
            let hsd = 0;
            if(itemInList.date > 0) hsd = Date.now() + itemInList.date*24*60*60*1000;
            g = {
                id : string.az(10),
                active : 'hanhtrang',
                info : dataVP.info,
                item : dataVP.id,
                soluong : 1, 
                khoa : 0,
                level : 0,
                lastTime : Date.now(),
                hsd : hsd,
            };
            my.ruong.item.push(g)  
        }
        else 
        if(dataVP.type == 'item') 
        {
            let soluong = 0;
            if(itemInList.soluong == 0) soluong = string.rand(itemInList.sl_rand[0],itemInList.sl_rand[1]);
            else soluong = itemInList.soluong;
    
            let daco = my.ruong.item.find(e => e.item == dataVP.id && e.active == 'hanhtrang');
            if(daco) {
                daco.soluong = daco.soluong*1 + soluong;
            } 
            else 
            {
                let g; 
                let hsd = 0;
                if(itemInList.date > 0) hsd = Date.now() + itemInList.date*24*60*60*1000;
                g = {
                    id : string.az(10),
                    active : 'hanhtrang',
                    item : dataVP.id,
                    soluong : soluong, 
                    khoa : 0,
                    level : 0,
                    lastTime : Date.now(),
                };
                my.ruong.item.push(g)  
            }
        }
    
        myItem.soluong = myItem.soluong*1 - 1;
        if(myItem.soluong <=0) my.ruong.item = my.ruong.item.filter(e => e.id != myItem.id);
    
        redis.setPlayery(my).then(() => {
            socket.send({
                i : i, 
                ruong : my.ruong,
                tien : my.tien,
                kq : phantuMang,
                id : id,
            },"OPEN_RUONG");
            socket.awaitOpenRuong = false;

        })
    
    
        
    });

}