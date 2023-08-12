let string = require('../../../Model/string.js');


module.exports = function(socket, my, item) {

    if(item.class && item.class != my.info.coban.type && item.class != 'all') return socket.sendCode(-45320);
    if(item.sucmanh && item.sucmanh > my.info.coban.sucmanh) return socket.sendCode(-4533);

    if(!item.hoc) {
        console.log('Không có thông tin học kĩ năng');
        return socket.sendCode(6);
    }
    if(!item.hoc.id) {
        console.log('không thấy id kĩ năng');
        return socket.sendCode(6);
    }
    if(!item.hoc.level){
        console.log('Không có lv')
        socket.sendCode(6);
    }

    my = string.info(my);

    let myskill = my.skill.find(e=>e.id == item.hoc.id);
    if(!myskill) {
        console.log('Bạn không có skill này.')
        return socket.sendCode(6);
    }

    /**đã học kĩ năng */
    if(myskill.level >= item.hoc.level) {
        return socket.sendCode(-4532);
    }

    if(myskill.level != item.hoc.level-1) {
        return socket.sendCode(-4531);
    }


    // trừ vp
    let vp = string.setItem(my.id, item.id, -1,item, my);
    myskill.level = item.hoc.level;

    socket.send({
        _1 : my.ruong,
        _2 : my.skill,
    },'useskill');


}