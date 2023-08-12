let string = require('../Model/string.js');


let snowlyvnDetu = function(io) 
{

    setInterval(function() {
        for(let i = 0; i< player.length; i++)
        {
            let nguoichoi = player[i];
            if(nguoichoi.detu && nguoichoi.detu.id)
            {
               
                let detu = nguoichoi.detu;
                detu.info.timehoisinh = detu.info.timehoisinh || 0;
                if(detu.info.chiso.hp <=0 && detu.info.timehoisinh  == 0) {
                    detu.info.timehoisinh = Date.now() + 10000;
                } 
                else
                if(detu.info.chiso.hp <=0 && detu.info.timehoisinh != 0 && detu.info.timehoisinh  <= Date.now())
                {
                    detu.info.chiso.hp = detu.info.chiso.hpFull;
                    detu.info.timehoisinh = 0;
                    detu.pos = {
                        map : nguoichoi.pos.map,
                        zone : nguoichoi.pos.zone,
                        x : nguoichoi.pos.x,
                        y : nguoichoi.pos.y,
                    }
                    io.sendMap({
                        _1 : detu.id,
                        _2 : detu.id,
                        _3 : detu.info.chiso.hpFull,
                        _4 : 'conghp',
                        _5 : {
                            hp : detu.info.chiso.hp,
                            ki : detu.info.chiso.ki,
                            kiFull : detu.info.chiso.kiFull,
                            hpFull : detu.info.chiso.hpFull,
                        }, 
                        _6 : {
                            hp : detu.info.chiso.hp,
                            ki : detu.info.chiso.ki,
                            kiFull : detu.info.chiso.kiFull,
                            hpFull : detu.info.chiso.hpFull,
                        }, 
                        _e : string.rand(1,100),
                    },detu);

                    if(detu.info.trangthai != 'venha') 
                    {
                        io.to(nguoichoi.socket).emit(string.az(2,5),
                            {
                                _1 : detu.id,
                                _2 : 'Sư phụ ơi con đây nèk',
                                _h : string.rand(1,100),
                             }
                        )
                        io.sendMap({
                            _1 : detu.id,
                            _n : string.az(1,50),
                        },detu); // gửi tới bản đồ xem có người chơi này chưa....
                    }
                }
            }
        }
    },1000);

}

module.exports = function(io) 
{
    snowlyvnDetu(io);
}