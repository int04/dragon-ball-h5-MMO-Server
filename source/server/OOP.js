let string = require('../Model/string.js');
let redis = require('../Model/redis.js');


let skill = require('../../source/Model/base/skill.js');
let hieuUng = (socket,e) => {
    e.eff = string.eff(e.eff);
    let change = 0;

    

    // khiêng năng lượng 

    if(e.eff.khieng && e.eff.khieng.active)
    {
        if(e.eff.khieng.vo == true)
        {
            console.log('Dã hết time')
            e.eff.khieng.active = false;
            e.eff.khieng.vo = false;
            socket.chipi('Ôi không, khiêng năng lượng bị hắn phá vỡ mất rồi.')
            socket.sendMap({
                _j : string.rand(1,100),
                _1 : e.id, 
                _2 : e.info,
                _3 : e.skin,
            });
            change = 1;
        }
    }


    if(e.eff.hoakhi && e.eff.hoakhi.active)
    {
        if(e.eff.hoakhi.time <= Date.now() || e.info.chiso.hp <= 0)
        {
            e.eff.hoakhi.active = false;
            e = string.updatePlayer(e);
            socket.sendMap({
                _j : string.rand(1,100),
                _1 : e.id, 
                _2 : e.info,
                _3 : e.skin,
            });
            change = 1;
        }
    }


    if(e.eff.hoakhi && e.eff.hoakhi.status == true && e.eff.hoakhi.timeawait <= Date.now())
    {
        e.eff.hoakhi.time = Date.now() + e.eff.hoakhi.tacdung*1000;
        e.eff.hoakhi.timeawait = 0;
        e.eff.hoakhi.status = false;
        if(e.info.chiso.hp >=1)
        {
            e.eff.hoakhi.active = true;
            e = string.updatePlayer(e);
            e.info.chiso.hp = e.info.chiso.hpFull;
            e.info.chiso.ki = e.info.chiso.kiFull;
            socket.sendMap({
                _j : string.rand(1,100),
                _1 : e.id, 
                _2 : e.info,
                _3 : e.skin,
            });
        }

        change += 1;


    }

    if(e.eff)
    {
        for(let eff in e.eff)
        {
            if(e.eff[eff].time <= Date.now() && e.eff[eff].active == true)
            {
                e.eff[eff].active = false;
                change = 1;
            }
        }
    }

    if(change !=0) {
        socket.sendMap({eff : [{id : e.id, eff : e.eff}]});
    }


    if(e.eff && e.eff.taitaonangluong && e.eff.taitaonangluong.active == true) {
        let mySKill = e.skill.find(e2 => e2.id == 8);
        if(mySKill) {
            let lvSkill = mySKill.level;
            let infoSkill = skill.find(e2 => e2.id == 8);
            if(infoSkill) {

                let tacdung = infoSkill.dame[lvSkill];
				let hpcong = e.info.chiso.hpFull / 100 * tacdung;
				hpcong = Math.round(hpcong);
				if(e.eff && e.eff.taitaonangluong && e.eff.taitaonangluong.time <= Date.now()) {
					e.eff.taitaonangluong.active = false;
					socket.sendMap({
						_1 : e,
						_g : string.rand(1,100),
					})
				}
                else

				if(e.info.chiso.hp <=0) 
				{
					e.eff.taitaonangluong.active = false;
					socket.sendMap({
						_1 : e,
						_g : string.rand(1,100),
					})
					
				} 
                else 
                {
                    e.info.chiso.hp += hpcong;
                    if(e.info.chiso.hp > e.info.chiso.hpFull) e.info.chiso.hp = e.info.chiso.hpFull;
                    let kicong = e.info.chiso.kiFull / 100 * tacdung;
                    kicong = Math.round(kicong);
                    e.info.chiso.ki += kicong;
                    
                    if(e.info.chiso.ki > e.info.chiso.kiFull) e.info.chiso.ki = e.info.chiso.kiFull;
    
                    if(e.info.chiso.hp >= e.info.chiso.hpFull && e.info.chiso.ki >= e.info.chiso.kiFull) {
                        e.eff.taitaonangluong.active = false;
                        socket.sendMap({
                            _1 : e,
                            _g : string.rand(1,100),
                        })
                    }
    
                    socket.sendMap({
                        _1 : e.id,
                        _2 : e.id,
                        _3 : hpcong,
                        _4 : 'conghp',
                        _5 : {
                            hp : e.info.chiso.hp,
                            ki : e.info.chiso.ki,
                            kiFull : e.info.chiso.kiFull,
                            hpFull : e.info.chiso.hpFull,
                        }, 
                        _6 : {
                            hp : e.info.chiso.hp,
                            ki : e.info.chiso.ki,
                            kiFull : e.info.chiso.kiFull,
                            hpFull : e.info.chiso.hpFull,
                        }, 
                        _e : string.rand(1,100),
                    });
                }

				

            }
        }
    }

    redis.setPlayer(e);


}


let hoihp = async function(socket) {

    let e = socket.my;

    e.timeawait = e.timeawait || {
        timehs : 0,
    };

    if(e.timeawait.timehs <= Date.now())
    {

        e.timeawait.timehs = Date.now() + 30000;
        let hpnhan = 0;
        let kinhan = 0;

        hpnhan+= e.info.chiso.hoihp30s;
        kinhan+= e.info.chiso.hoiki30s;



        hpnhan+= e.info.chiso.hpFull/100*e.info.chiso.hoiMau;
        kinhan+= e.info.chiso.kiFull/100*e.info.chiso.hoiKi;

        hpnhan = Math.round(hpnhan);
        kinhan = Math.round(kinhan);


        if((hpnhan >= 1 || kinhan >=1) && (e.info.chiso.hp < e.info.chiso.hpFull || e.info.chiso.ki < e.info.chiso.kiFull)) 
        {
            e.info.chiso.hp+= hpnhan;
            e.info.chiso.ki+= kinhan;
            if(e.info.chiso.hp > e.info.chiso.hpFull) e.info.chiso.hp = e.info.chiso.hpFull;
            if(e.info.chiso.ki > e.info.chiso.kiFull) e.info.chiso.ki = e.info.chiso.kiFull;
            socket.sendMap({
                _1 : e.id,
                _2 : e.id,
                _3 : hpnhan,
                _4 : 'conghp',
                _5 : {
                    hp : e.info.chiso.hp,
                    ki : e.info.chiso.ki,
                    kiFull : e.info.chiso.kiFull,
                    hpFull : e.info.chiso.hpFull,
                }, 
                _6 : {
                    hp : e.info.chiso.hp,
                    ki : e.info.chiso.ki,
                    kiFull : e.info.chiso.kiFull,
                    hpFull : e.info.chiso.hpFull,
                }, 
                _e : string.rand(1,100),
            });
        }
    }

    hieuUng(socket,e);

}

let running = async function(io) {

    let allSockets = io.of('/').sockets;

    for(let i of allSockets) {
        let player = i[1];
        if(player.uid >=1) 
        {
            hoihp(player);
        }
    }
    
    let playerOnline = 0;
    
    

    setTimeout(function() {
        running(io);
    }, 1000);
}


module.exports = async function(io) {
    running(io)
}