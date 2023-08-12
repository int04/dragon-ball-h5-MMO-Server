let string = require('../../../Model/string.js');

module.exports = function(socket,nguoibigiet,nguoigiet) 
{
    let myid = socket.uid;
    if(nguoigiet.id == myid) {
        // xử lý các task nếu là người giết đối thủ.
    } 

    /* ################ kiểm tra hoạt động của người bị giết ######### */

    // hoạt động pvp 
    let pvpIndex = cache.pk.in.findIndex(e => e.from == nguoibigiet.id || e.to == nguoibigiet.id);
    let pvp = cache.pk.in[pvpIndex];
    if(pvp) 
    {
        let vang = pvp.vang;
        let users_win = 0; 
        if(nguoibigiet.id == pvp.from) users_win = pvp.to;
        if(nguoibigiet.id == pvp.to) users_win = pvp.from;
        let get = string.getMy(users_win);
        if(get) {
            get.tien.vang += vang;
            socket.sendTo(get.tien,users_win,'tien');
            socket.sendToChipi('Bạn giành chiến thắng',users_win);
            socket.sendToChipi('Bạn thua cuộc',nguoibigiet.id);
            cache.pk.in.splice(pvpIndex,1);
        }

    }



    /* #################kết thúc task kiểm tra #########################*/
}