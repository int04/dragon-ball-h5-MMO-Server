let redis = require('../../../Model/redis.js');
let string = require('../../../Model/string.js');

let success = require('../success.js');

module.exports = async function(socket,data_skill,getMySkillLevel) {
    let my = socket.my;


    let redisID = string.az(10);
    let keyid = redisID;

    let listPlayerInZone = await redis.playerInZone(my.pos.map,my.pos.zone);
    for(let users of listPlayerInZone)
    {
        let hpnhan = Math.round( data_skill.dame[getMySkillLevel]/100*users.info.chiso.hpFull);
        let kinhan = Math.round( data_skill.dame[getMySkillLevel]/100*users.info.chiso.kiFull);
        
        let id = string.az(10);

        let skill1 = await redis.setSkill({
            id : string.az(10),
            keyid : redisID,
            from : socket.uid,
            to : users.id,
            value : hpnhan,
            type : 'conghp',
            loai : 'player' // đối tượng nhận
        });


        if(socket.uid != users.id)
        {
            let skill2 = await redis.setSkill({
                id : string.az(10),
                keyid : redisID,
                from : socket.uid,
                to : users.id,
                value : kinhan,
                type : 'congki',
                loai : 'player' // đối tượng nhận
            });
        }

        if(users.id != socket.uid)
        {
            socket.sendMap({
                _1 : users.id,
                _2 : 'duoccuu',
                _3 : keyid,
                _f : string.rand(1,100),
            })
            socket.sendMap({
                _1 : users.id,
                _2 : 'Cảm ơn '+my.name+' đã cứu mình.',
                _h : string.rand(1,100),
            });
        } 
    }

    socket.sendMap({
        _1 : socket.uid,
        _2 : 'dicuu',
        _3 : keyid,
        _f : string.rand(1,100),
    }
    )

    success(socket,keyid)

    console.log('Xòng');

}