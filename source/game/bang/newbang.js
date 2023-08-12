
let icon = require('./icon.js');
let mysqli = require('../../Model/mysqli.js');
let string = require('../../Model/string.js');

module.exports = function(socket,data) 
{
    let name = data.name;
    let iconID = data.iconID;

    console.log('tạo bang')
    // allow A-Z, a-z, 0-9, -, _, and space
    if(!name || !iconID || name.length < 3 || name.length > 20 || !/^[A-Za-z0-9_\- ]+$/.test(name)) return socket.noti('Tên bang từ 3 -> 20 kí tự. Không được sử dụng kí tự đặc biệt.');

    let iconData = icon.find(e=>e.id == iconID);
    if(!iconData) return socket.noti('Không tồn tại biểu tượng này.');

    let my = socket.my;
    if(!my) return socket.noti("Không tìm thấy nhân vật.");

    if(my.skin && my.skin.bangID >=1) return socket.chipi("Bạn đã gia nhập bang hội rồi");

    if(my.tien[iconData.type == 1 ?'vang' : 'zeni'] < iconData.cost) return socket.chipi('Không đủ tiền để thực hiện.');

    let info = {
        icon : iconID,
        exp : 0,
        level : 1,
        max : 10,
        desc : '',
        vang : 0,
        sucmanh : 0,
        time : Date.now(),
    };
    let menber = [];
    menber.push({
        id : my.id,
        time : Date.now(),
        right : 2,
        name : my.name,
        skin : my.skin,
        avatar : my.info.coban.avatar, 
        sucmanh : my.info.coban.sucmanh,
        chodau : 0,
        nhandau : 0,
    })

    mysqli.query(`INSERT INTO banghoi (name, info, menber) VALUES ('${name}', '${JSON.stringify(info)}', '${JSON.stringify(menber)}') `,function(err,rows) {
        if(err) {
            console.log(err)
            return socket.noti('Lỗi máy chủ. Vui lòng liên hệ admin');
        }

        my.skin.bangID = rows.insertId;
        my.skin.bang = iconID;
        my.tien[iconData.type == 1 ?'vang' : 'zeni'] -= iconData.cost;
        socket.send(my.tien,'tien');
        socket.send(my.skin,'skin');

        socket.sendMap({
            id : my.id,
            skin : my.skin,
        },'skin_map');

        socket.chipi("Tạo bang thành công.");

        string.update(my);
        string.log(my.id,`Tạo bang ${name}, trừ ${iconData.cost} ${iconData.type == 1 ?'vang' : 'zeni'} `);

        // return bang....


    });



    

} 