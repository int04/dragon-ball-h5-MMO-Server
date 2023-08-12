let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');

function tangHP(now, soluong) {
    soluong = soluong || 20;
    let can = 0;
    let datang = 0;
    while(soluong != datang) {
        datang += 20;
        can += now / 20 + now;
    }
    return Math.round(can);
}

function tangSucDanh(now, soluong) {
    soluong = soluong || 1;
    let can = 0;
    let datang = 0;
    while(soluong != datang) {
        datang += 1;
        if(now < 1000) {
            can += now / 10 + now;
        } else {
            can += (now / 10 + now) * 100;
        }
    }
    return Math.round(can);
}

function tangchiMang(now) {
    let can = 0;
    let datang = 0;
    let Array = [50, 5000, 25000, 50000, 125000, 300000, 400000];

    return Array[now] * 1000000 || 0;
}

function tangGiap(now, soluong) {
    soluong = soluong || 1;
    let can = 0;
    let datang = 0;
    while(soluong != datang) {
        datang += 1;
        if(now < 100) {
            can += now * 500000 / 50 + 500000;
        } else
        if(now < 3000) {
            can += (now * 500000 / 50 + 500000) * 10;
        } else {
            can += (now * 500000 / 50 + 500000) * 100;
        }
    }
    return can;
}


module.exports = function(socket,data) {
    if(socket.uid <=0) return;

    let newid = data._1;
    let value = data._2;
    if(value <=0) return socket.chipi("Không hợp lệ");

    if(socket.awaitTiemNang == true) return console.log('Đang thực hiện');

    socket.awaitTiemNang = true;
    
    let my = socket.my;

    if(!my) {
        socket.awaitTiemNang= false;
        return socket.noti("Không hợp lệ");
    }
    let obj = ["hpGoc","kiGoc","sucdanhGoc","chimangGoc","giapGoc"];

    let chiso = obj[newid];
    let arrayUp = [20, 200, 2000];
    arrayUp = chiso == 'hpGoc' ? [20, 200, 2000,20000] : arrayUp;
    arrayUp = chiso == 'kiGoc' ? [20, 200, 2000,20000] : arrayUp;
    arrayUp = chiso == 'sucdanhGoc' ? [1, 10, 100,1000] : arrayUp;
    arrayUp = chiso == 'chimangGoc' ? [1] : arrayUp;
    arrayUp = chiso == 'giapGoc' ? [1, 10, 100] : arrayUp;

    if(arrayUp.findIndex(e => e == value) == -1) {
        socket.awaitTiemNang= false;
        return socket.chipi("Có lỗi xẩy ra");
    }

    let need = 0;
    need = chiso == 'hpGoc' ? tangHP(my.info.chiso[chiso], value) : need;
    need = chiso == 'kiGoc' ? tangHP(my.info.chiso[chiso], value) : need;
    need = chiso == 'sucdanhGoc' ? tangSucDanh(my.info.chiso[chiso], value) : need;
    need = chiso == 'chimangGoc' ? tangchiMang(my.info.chiso[chiso], value) : need;
    need = chiso == 'giapGoc' ? tangGiap(my.info.chiso[chiso], value) : need;

    if(my.info.coban.tiemnang < need) {
        socket.awaitTiemNang= false;
        return socket.chipi("Chưa đủ tiềm năng để cộng.");
    }

    my.info.coban.tiemnang -= need;
    my.info.chiso[chiso] += value;
    my.info.coban.tiemnangCong += need;
    my = string.updatePlayer(my,socket);
    redis.setPlayer(my).then(()=>{
        socket.sendCode(-98512103);
        socket.awaitTiemNang= false;
    });


    
}