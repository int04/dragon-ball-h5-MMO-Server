let string = require('../Model/string.js');

/* Xử lý các hoạt động trong game */

let pvpActive = function(io) 
{
    if(cache.pk.in.length >=1)
    {
        cache.pk.in.forEach((pvp,index) => {
            let p_1 = string.getMy(pvp.from);
            let p_2 = string.getMy(pvp.to);
    
            // p_1 thoát game p_2 thắng
            if(!p_1) {
                p_2.tien.vang += pvp.vang;
                io.sendTo(p_2.tien,p_2.id,'tien');
                io.chipi('Đối thủ thoát game, bạn thắng !',p_2.id);
                cache.pk.in.splice(index,1);
            }
            else 
            if(!p_2) 
            {
                p_1.tien.vang += pvp.vang;
                io.sendTo(p_1.tien,p_1.id,'tien');
                io.chipi('Đối thủ thoát game, bạn thắng !',p_1.id);
                cache.pk.in.splice(index,1);
            }
            else
            if(p_1 && (p_1.pos.map != pvp.map || p_1.pos.zone != pvp.zone)) 
            {
                p_2.tien.vang += pvp.vang;
                io.sendTo(p_2.tien,p_2.id,'tien');
                io.chipi('Đối thủ rời bản đồ ! Bạn thắng',p_2.id);
                io.chipi('Bạn bị xử thua do rời khỏi bản đồ',p_1.id);
                cache.pk.in.splice(index,1);
            }
            else 
            if(p_2 && (p_2.pos.map != pvp.map || p_2.pos.zone != pvp.zone))
            {
                p_1.tien.vang += pvp.vang;
                io.sendTo(p_1.tien,p_1.id,'tien');
                io.chipi('Đối thủ rời bản đồ ! Bạn thắng',p_1.id);
                io.chipi('Bạn bị xử thua do rời khỏi bản đồ',p_2.id);
                cache.pk.in.splice(index,1);
            }
    
        });
    }
}

module.exports = function(io) 
{
    pvpActive(io);
}