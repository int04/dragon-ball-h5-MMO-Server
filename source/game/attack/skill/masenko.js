let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');


module.exports = async function(socket,data_skill,getMySkillLevel,sql) {
    let my = socket.my;

    let keyid = string.az(11);
    
    let solan =  data_skill.solan[getMySkillLevel];
    for(let i = 0; i< solan; i++) 
    {
        let dame = my.info.chiso.kiFull/100 * 50;
        dame += my.info.chiso.sucdanh; 
        let damebouns = dame/100*105;
        dame = string.rand(dame,damebouns);
        dame = Math.round(dame);
        let newid = string.az(10);
        dame = dame - sql.info.chiso.giap;
        let chimang = my.info.chiso.chimang;
        if(string.rand(0,100) <= chimang) {
            dame *= 2;
            await redis.setSkill({
                keyid : newid,
                from : my.id, // nguyên nhân
                to : my.id, // đối tượng trực tiếp 
                value : 0,
                type : 'chimang',
                loai : 'player' // đối tượng nhận
            });
        }

        await redis.setSkill({
            keyid : newid,
            from : my.id,
            to : sql.id,
            value : dame,
            type : 'truhp',
            loai : sql.type, // đối tượng nhận
        })

        setTimeout(() => {
            socket.sendMap({
                _1 : socket.uid,
                _4 : sql.id,
                _2 : 'masenko',
                _3 : newid,
                _f : string.rand(1,100),
            }
            )
        }, 200 * i);

    }

    redis.setPlayer(my);

}