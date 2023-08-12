let getMy = require('./getMy');
let redis = require('../../Model/redis.js');
let string = require('../../Model/string.js');
let playerDie = require('./playerDie.js');
module.exports = function(io,data) 
{
    let player = getMy(io,data.uid);
    if(!player) return false;

    let infoPlayer = player.my;

    let tanCong = data.dame;
    let giap = infoPlayer.info.chiso.giap;
    let dame = tanCong - giap;
    let dameMax = tanCong/100*110;
    dame = string.rand(dame,dameMax);
    dame = infoPlayer.eff && infoPlayer.eff.khieng && infoPlayer.eff.khieng.active == true ? 1 : dame;
    if(dame < 0) dame = 0;
    let e = data.e;
    let victim = infoPlayer.id;

    if(infoPlayer.info.chiso.hp >= 1 && infoPlayer.info.chiso.hp - dame <= 0) {
        playerDie(player,e,'mob');
    }

    if(dame > 0) 
    {
        infoPlayer.info.chiso.hp -= dame;

        player.sendMap({
            _1 : e.id,
            _2 : victim,
            _3 : dame,
            _4 : 'truhp',
            _5 : {
                hp : e.info.chiso.hp,
                ki : e.info.chiso.ki,
                kiFull : e.info.chiso.kiFull,
                hpFull : e.info.chiso.hpFull,
            }, 
            _6 : {
                hp : infoPlayer.info.chiso.hp,
                ki : infoPlayer.info.chiso.ki,
                kiFull : infoPlayer.info.chiso.kiFull,
                hpFull : infoPlayer.info.chiso.hpFull,
                sucmanh : infoPlayer.info.coban.sucmanh,
                tiemnang : infoPlayer.info.coban.tiemnang,
            },
            _e : string.rand(1,100), // gửi tới id này
        });
        
        redis.setPlayer(infoPlayer).then(() => {
        });

    }

}