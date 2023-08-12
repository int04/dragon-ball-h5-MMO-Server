let skill = require('../../Model/base/skill')
let string = require('../../Model/string')
let quai = require('../../Model/base/quai')

let redis = require('../../Model/redis.js');

let checkAttackPlayer = require('./player.js');

module.exports = function(socket,data)
{

    // get all connect socket 

    let from = data._4;
    let UIDTHUCHIEN = socket.uid;


    if(!!from) UIDTHUCHIEN = from;
    if(UIDTHUCHIEN <=0) return console.log('Không có uid');
    let id = data._1 >>0;
    let OOP = data._3;
    if(!OOP) return console.log('Không có OOP');
    if(!id) return console.log('Không thấy id skill'); // Không tìm thấy id kĩ năng
    let victim = data._2;
    if(!victim) return console.log('không thấy mục tieu');

    let mucTieu;
    if(OOP ==1) mucTieu = redis.getMob(victim);
    if(OOP == 2) mucTieu = redis.getPlayer(victim);
    if(OOP == 3) mucTieu = redis.getBoss(victim);


    let time = Date.now();

    Promise.all([ mucTieu ]).then( async res => {
        let my = socket.my;
        mucTieu = res[0];
        if(!my) return console.log('Không thấy bản thân'); // không tìm thấy bản thân
        if(!mucTieu) return console.log('Không thấy mục tiêu'); // không tìm thấy mục tiêu
        my.eff = string.eff(my.eff);
        let choang = string.choang();
        let bichoang = 0;
        choang.forEach(element => {
            if(my.eff[element] && my.eff[element].active == true ) {
                bichoang = 1;
                console.log('bị choáng',element)
            }
        });
        if(bichoang == 1) return string.bug('không thể thực hiện');
    
        let data_skill = skill.find(e => e.id == id);
        if(!data_skill) return console.log('Khongot tìm đc skill'); // không tìm thấy kĩ năng
        if(data_skill.type != 'attack') return console.log('Kĩ năng ko phải tc'); // không phải kĩ năng đánh
        if(mucTieu.info.chiso.hp <=0) return console.log('Mục tiêu đã chết'); // mục tiêu đã hết HP
        let dame = 0;
        let getMySkill = my.skill.find(e => e.id == id);
        if(!getMySkill) return console.log('Không tìm thấy skil;l'); // không tìm thấy kĩ năng của bản thân
        let getMySkillLevel = getMySkill.level;
        if(getMySkill.time >= Date.now()) return console.log('Chưa hồi'); // chưa hồi kĩ năng
    
        if(mucTieu.type == 'player') {
            let checked = await checkAttackPlayer(my,mucTieu);
            if(!checked) return console.log('Không thể đánh'); // không thể đánh
        }
    
        if(mucTieu.pos.map != my.pos.map || mucTieu.pos.zone != my.pos.zone) return console.log('Không thể đánh'); // không thể đánh
    
        let ki = 0;
    
        if(data_skill.kit == 1) ki = data_skill.ki[getMySkillLevel];
        if(data_skill.kit == 2) ki =  my.info.chiso.kiFull/ 100 *   data_skill.ki[getMySkillLevel] ;
    
        if(my.info.chiso.hp <= 0) return console.log('hết mẹ hp rồi.'); // ki không đủ
    
        if(my.info.chiso.ki < ki) return console.log('Ki ko đủ'); // ki không đủ
    
        getMySkill.time = Date.now() + (data_skill.time[getMySkillLevel]/(from ? 2 : 1)) * 1000;
        socket.emit('2b',data_skill.id,data_skill.time[getMySkillLevel]);
    
    
        getMySkill.lasttime = Date.now();
    
        let keyid = string.az(10);
    
        let nameObject = 'mob';
        if(OOP == 2) nameObject = 'player';
        if(OOP == 3) nameObject = 'boss';
    

        let promi = [];

    
        if(data_skill.type == 'attack'){
    
            let sucDanh = my.info.chiso.sucdanh;
            let dameSkill = sucDanh/100*data_skill.dame[getMySkillLevel];
            let damebouns =  dameSkill/100*105;
            dame = string.rand(dameSkill,damebouns) - mucTieu.info.chiso.giap;
            dame = dame < 0 ? 0 : Math.round(dame);
    
            if(nameObject == 'boss') 
            {
                if(data_skill.id == 5) 
                {
                    // quả cầu kênh khí lên boss = 10% hp
                    dame = mucTieu.info.chiso.hp/100*10;
                    dame = Math.round(dame);
                    dame = string.rand(dame,dame*1.5);
                    dame = Math.round(dame);
                }
            }
    
            let chimang = my.info.chiso.chimang;
            if(string.rand(0,100) <= chimang) {
                dame *= 2;
                promi.push(redis.setSkill(string.rand(1,100000),
                {
                    keyid : keyid,
                    from : UIDTHUCHIEN, // nguyên nhân
                    to : UIDTHUCHIEN, // đối tượng trực tiếp 
                    value : 0,
                    type : 'chimang',
                    loai : 'player' // đối tượng nhận
                }
                ));
    
            }
            
            
            promi.push(redis.setSkill(string.rand(1,100000), {
                keyid : keyid,
                from : UIDTHUCHIEN,
                to : victim,
                value : dame,
                type : 'truhp',
                loai : nameObject, // đối tượng nhận
            }));
            

            
    
            promi.push(redis.setSkill(string.rand(1,100000), {
                keyid : keyid,
                from : UIDTHUCHIEN, // nguyên nhân
                to : UIDTHUCHIEN, // đối tượng trực tiếp trừ
                value : ki,
                type : 'truki',
                loai : 'player' // đối tượng nhận
            }));
        }

        promi.push(redis.setPlayer(UIDTHUCHIEN,my));

        Promise.all(promi).then(data => {
            //console.log('attack',Date.now() - time,'ms');

            socket.sendMap({
                _1 : UIDTHUCHIEN,
                _2 : 'attack',
                _3 : id,
                _4 : getMySkillLevel,
                _5 : victim,
                _6 : keyid,
                _7 : !!from ? true : false,
                _d : string.rand(1,50),
            });
        });

        

        
    });

    
}

