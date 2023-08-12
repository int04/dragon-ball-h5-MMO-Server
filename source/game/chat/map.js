let string = require('../../Model/string.js');

let redis = require('../../Model/redis.js');

module.exports = function(socket,data)
{
    if(socket.uid <=0) return socket.sendCode(-999);
    redis.getPlayer(socket.uid).then(my => {
        if(!my) return socket.sendCode(-999);
        if(data && typeof data == 'string' || typeof data == 'number') {
            if(data.length <= 200) {
                    socket.sendMap({
                    _1 : socket.uid,
                    _2 : data,
                    _h : string.rand(1,100),
                    })
    
                if(my.detu && my.detu.id) 
                {
                    let detu = my.detu; 
                    // cover data to lower
                    data = data.toLowerCase();
                    let msg = '';
                    if(data == 'ditheo' || data == 'di theo')
                    {
                        detu.info.trangthai = 'ditheo';
                        msg = 'OK con sẽ đi theo sư phụ.';
                    } 
                    if(data == 'tancong' || data == 'tan cong') 
                    {
                        detu.info.trangthai = 'tancong';
                        msg = 'Sư phụ cứ để con lo.';
                    }
                    if(data == 'bao ve' || data == 'bao ve') 
                    {
                        detu.info.trangthai = 'baove';
                        msg = 'Con sẽ bảo vệ sư phụ.';
                    }
                    if(data == 'venha' || data == 've nha') 
                    {
                        if(player.find(e => e.id == detu.id))
                        {
                            detu = player.find(e => e.id == detu.id);
                        }
                        detu.info.trangthai = 'venha';
                        msg = 'bai bai sư phụ, con về với mẹ đây.';
                        redis.delPlayer(detu.id);
                    }
                    if(msg.length > 0)
                    {
                        socket.emit(string.az(2,10),{
                            _1 : detu.id,
                            _2 : msg,
                            _h : string.az(1,10),
                        });
        
                        socket.sendMap({
                            _1 : my.id, 
                            _2 : detu, 
                            _m : string.az(1,10)
                        })
                        redis.setPlayer(my);
                    }
    
                }
            }
        } 

    });
    
}