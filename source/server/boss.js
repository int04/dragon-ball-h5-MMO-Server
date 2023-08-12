
let data_boss = require('../Model/base/boss');
let string = require('../Model/string');

let skill = require('../Model/base/skill');

let mapData = require('../Model/base/map');

let kill = require('./skill/kill.js');

let active = require('./active.js');

let redis = require('../Model/redis.js');

let startBoss = function(io,id,map,zone)
{
    /**
     * @@return
     * @io : socket
     * @id : id boss
     * @mapzone => map và zone
     */
    let element = data_boss.find(e => e.id == id);
    if(element) 
    { 
        let idmap = mapData.find(e => e.id == map);
        if(!idmap) return console.log('Không tìm thấy map');
        let namemap = idmap.name;
        let notice = 1;
        if(element.noti && element.noti.block_on == true) notice = 0;
        if(notice == 1)
            io.sendAll('BOSS '+element.name+' vừa xuất hiện ở '+namemap+' khu '+zone+' ','server');
        let skill = [];
        for(let id in element.skill) {
            skill.push({
                id : id,
                level : element.skill[id],
                time : 0, 
            })  
        }

        redis.getAllBoss().then(listBOSS => {
            let list = listBOSS.filter(e => e.uid == element.id);
            if(list.length > 0) return console.log('Boss đã tồn tại');
            let redisID = string.az(10);
            let json = { 
                type : 'boss',
                id : redisID,
                name : element.name,
                uid : element.id,
                eff : {
                    choang :  {active : false, time : 0},
                    taitaonangluong : {active : false, time : 0},
                    thaiduonghasan :  {active : false, time : 0},
                    hoakhi : {active : false, time : 0, timeawait : 0, status : false},
                    khieng : {active : false, time : 0},
                    rungu : {active : false, time : 0},
                },
                skin : {
                    ao : element.script.ao,
                    quan : element.script.quan || "tWNvFxfloN",
                    dau : element.script.dau || "GaMtSOeboy",
                    theobo : element.script.theobo || null,
                }, 
                info : {
                    chiso :{
                        hp : element.chiso.hp,
                        hpFull : element.chiso.hp,
                        sucdanh : element.chiso.sucdanh,
                        giap : element.chiso.giap,
                        ki : 0,
                        kiFull : 0,
                        
                    },
                    coban : {
                        avatar : "516",
                        sucmanh : 100,
                    },
                    'act' : 'attack',
                    'move' : 'right',
                    speed : element.speed,
                    
                },
                skill : skill,
                victim : [], // đối tượng đã đánh
                pos : {
                    map : map,
                    zone : zone,
                    x : 0, 
                    y : 0,
                },
                
    
            };
            redis.setBoss(redisID,json);
        });

        

    }
    
}

let hoisinhBoss = function() {
    redis.getBossDie().then(array => {
        let list = array.filter(e => e.time <= Date.now());
        list.forEach(e => {
            let idBoss = e.id;
            let element = data_boss.find(e => e.id == idBoss);
            if(element) {
                let map = 0;
                let maprandom = element.map[string.rand(0,element.map.length-1)];
                let zone = 0;
                map = maprandom;
                startBoss(io,element.id,map,zone);
            }
        });
    });
}

let createBot = function(io) 
{
    let time = 1000;
    setTimeout(() => {
        let listTao = data_boss.filter(e => e.on == 1);
        listTao.forEach(element => {
            let map = 0;
            let maprandom = element.map[string.rand(0,element.map.length-1)];
            let zone = 0;
            map = maprandom;
            
            startBoss(io,element.id,map,zone);
    
            
        });

    

    }, time);
}


// import skill
let rungu = require('./skill/rungu.js');
let tdhs = require('./skill/tdhs.js');
let masenko = require('./skill/masenko.js');
let boom = require('./skill/boom.js');
const e = require('cors');
let bossEFF = function(io,element)  
{
    let listSkill = element.skill.filter(e => e.time <= Date.now());
    if(listSkill.length > 0)
    {
        let skillUse = [];
        listSkill.forEach(myskill => {
            let idskill = myskill.id;
            let level = myskill.level;
            let data_skill = skill.find(e => e.id == idskill);
            if(data_skill && data_skill.type == 'buff') {
                skillUse.push(idskill);
            }
        });

        if(skillUse.length > 0)
        {
            let idSkill = skillUse[string.rand(0,skillUse.length-1)];
            let myskill = element.skill.find(e => e.id == idSkill);
            let level = myskill.level;
            let data_skill = skill.find(e => e.id == idSkill);
            let time = data_skill.time[level] * 1000;

            myskill.time = Date.now() + time;

            if(idSkill == 3) 
            {
                // thái dương hạ san
                tdhs(io,element,data_skill,level);
            }

            // skill ru ngủ
            if(idSkill == 14 && element.victim.length > 0)
            {
                // ru ngủ
                rungu(io,element,data_skill,level);
            }
            if(idSkill == 12 && element.victim.length > 0)
            {
                // masenko
                masenko(io,element,data_skill,level);
            }

            if(idSkill == 10) {
                boom(io,element,data_skill,level);
            }
            if(idSkill == 8 ) 
            {
                 // tái toạ năng lượng
                element.eff = string.eff(element.eff);
                element.eff['taitaonangluong'].time = Date.now() + 10000; // 10k giây
                element.eff['taitaonangluong'].active = true;
                io.sendMap({
                    id : element.id,
                    d_eff : 'taitaonangluong',
                    active  : true,
                },element,"bossEffect")
            }

        }
    }
    return element;
}


updateMove = function(io)
{
    //console.log('Là mới')
    active(io);
    let hoisinh = BOSS_DIE.filter(e => e.time <= Date.now());
    if(hoisinh.length > 0)
    {
        hoisinh.forEach((element,index) => {
            let id = element.id;
            let boss = data_boss.find(e => e.id == id);
            if(boss)
            {
                let map = boss.map[string.rand(0,boss.map.length-1)];
                let zone = 0;
                startBoss(io,id,map,zone);
                BOSS_DIE.splice(index,1);
            }
        });
    }

    
    redis.getAllBoss().then(listBOSS => {

        Promise.all(listBOSS.map((element,index) => {
            return new Promise((res,reject) => {

                element.timeChat = element.timeChat || 0;
                element.tuvong = element.tuvong || 0;



                /* code */
                let infoBOSS = data_boss.find(e => e.id == element.uid);

                let bido = 0;
                let array = string.choang();
                let array2 = ["taitaonangluong"];
        
                let array3 = [];
                array3 = array3.concat(array,array2);
                
                array3.forEach(eff => {
                    if(element.eff[eff] && element.eff[eff].active == true) bido = 1;
                    if(element.eff[eff] && element.eff[eff].active == true && element.eff[eff].time <= Date.now()) {
                        element.eff[eff].active = false;
                        redis.setBoss(element.id,element);
                        io.sendMap({
                            id : element.id,
                            d_eff : eff,
                            active  : false,
                        },element,"bossEffect")
                    }
                });
        
                if(element.info.chiso.hp >=1) 
                {
                    if(element.eff['taitaonangluong'].active == true) 
                    {
                        let levelSkill = element.skill.find(e => e.id == 8).level;
                        let data_skill = skill.find(e => e.id == 8);
                        let dame = element.info.chiso.hpFull/100*data_skill.dame[levelSkill];
                        element.info.chiso.hp += Math.round(dame);
                        io.sendMap({
                            _1 : element.id,
                            _2 : 'Hồi phục '+Math.round(element.info.chiso.hp/element.info.chiso.hpFull*100)+'% năng lượng.',
                            _h : string.rand(1,100),
                        },element)
                        element.timeChat = Date.now() + infoBOSS.chat.delay;
                        if(element.info.chiso.hp > element.info.chiso.hpFull) {
                            element.info.chiso.hp = element.info.chiso.hpFull;
                            element.eff['taitaonangluong'].time = Date.now();
                        }
                        io.sendMap({
                            id : element.id,
                            hp : element.info.chiso.hp,
                            hpFull : element.info.chiso.hpFull,
                        },element,"bossUpdate")
                        redis.setBoss(element.id,element);
        
                    }
                }
        
                // chat 
                
                if(element.info.chiso.hp >=1) 
                {
                    if(element.timeChat <= Date.now()) 
                    {
                        element.timeChat = Date.now() + infoBOSS.chat.delay;
                        if(infoBOSS.chat.on.length > 0)
                        {
                            let noidung = infoBOSS.chat.on[string.rand(0,infoBOSS.chat.on.length-1)];
                            let mucTieu = element.victim;
                            if(mucTieu.length > 0)
                            {
                                redis.getPlayer2(mucTieu[0],element.pos.map,element.pos.zone).then(users => {
                                    if(users) 
                                    {
                                        noidung = noidung.replace('$',users.name);
                                    }
                                    else 
                                    {
                                        element.victim = [];
                                    }

                                    io.sendMap({
                                        _1 : element.id,
                                        _2 : noidung,
                                        _h : string.rand(1,100),
                                    },element)
                                });
                            }
                            else 
                            {
                                io.sendMap({
                                    _1 : element.id,
                                    _2 : noidung,
                                    _h : string.rand(1,100),
                                },element)
                            }
                        }
                        redis.setBoss(element.id,element);
                    }
                }

                // đánh hoặc di chuyển
        
                if(bido != 1 && element.info.chiso.hp > 0) 
                {
                    // xử lý tấn công
                    let mucTieu = element.victim;
                    if(mucTieu.length <=0) 
                    {
                        
                        redis.playerInZone(element.pos.map,element.pos.zone).then(async all => {
                            if(all.length > 0)
                            {
                                let dx = null;
                                for(let i = 0; i < all.length; i++)
                                {
                                    let doxa = Math.abs(element.pos.x - all[i].pos.x);
                                    if(dx  == null || dx > doxa ) 
                                    {

                                        let hp =  all[i].info.chiso.hp;
                                        if(hp <= 0) continue;
                                        dx = doxa;
                                        element.victim = [all[i].id];
                                        //console.log('Lấy',all[i].id)
                                        element.pos.x = all[i].pos.x;
                                        element.pos.y = all[i].pos.y;
                                    }
                                }
                                if(dx != null) {
                                    redis.setBoss(element.id,element).then(() => {
                                        res(true);
                                    });
                                }
                                else 
                                {
                                    res(true);
                                }
                            }
                            else {
                                res(true);
                            }
                        });

                    }
                    else
                    if(mucTieu.length > 0)
                    {
                        // kĩ năng tấn công.
                        redis.getPlayer2(mucTieu[0],element.pos.map,element.pos.zone).then(users => {
                            if(!users) 
                            {
                                element.victim = [];
                                redis.setBoss(element.id,element).then(() => {
                                    res(true);
                                })
                            }
                            else 
                            {
                                let hp = users.info.chiso.hp;
                                //console.log('hp',hp,users.id)
                                if(hp <=0) {
                                    //console.log('Hết hp',users.id)
                                    element.victim = [];
                                    redis.setBoss(element.id,element).then(() => {
                                        res(true);
                                    });
                                }
                                else 
                                {
                                    let dx = Math.abs(element.pos.x - users.pos.x);
                                    let listSkill = element.skill.filter(e => e.time <= Date.now());
                                    let skillUse = [];
                                    if(listSkill.length > 0)
                                    {
                                        listSkill.forEach(element2 => {
                                            let idskill = element2.id;
                                            let data_skill = skill.find(e => e.id == idskill);
                                            if(data_skill && data_skill.type == 'attack' && data_skill.dx >= dx ) {
                                                skillUse.push(idskill)
                                            }
                                        });
            

                                        if(skillUse.length > 0)
                                        {
                                            let idSkill = skillUse[string.rand(0,skillUse.length-1)];
                                            let level = element.skill.find(e => e.id == idSkill).level;
                                            let data_skill = skill.find(e => e.id == idSkill);
            
                                            let sucDanh = element.info.chiso.sucdanh;
                                            let dameSkill = sucDanh/100*data_skill.dame[level];
                                            let damebouns =  dameSkill/100*105;
                                            let dame = string.rand(dameSkill,damebouns) - users.info.chiso.giap;
                                            dame = dame < 0 ? 1 : Math.round(dame);
            
                                            
            
                                            if(dame > 0)
                                            {
                                                if(element.pos.x < users.pos.x)
                                                {
                                                    element.info.move = 'right';
                                                }
                                                else
                                                {
                                                    element.info.move = 'left';
                                                }
                                                io.sendMap({
                                                    _1 : element.id,
                                                    _2 : 'attack',
                                                    _3 : idSkill,
                                                    _4 : level,
                                                    _5 : users.id,
                                                    _6 : 'bossAttack',
                                                    _7 : true,
                                                    _d : string.rand(1,50),
                                                },element);
                                                // update time skill
                                                element.skill.find(e => e.id == idSkill).time = Date.now() + (data_skill.time[level] * 1000)/2;
            
                                                kill(io,element,dame,users,infoBOSS);
                                                redis.setBoss(element.id,element);
            
            
                                            }
                                            
                                        }
                                        else 
                                        {
                                            if(dx >= 400) 
                                            {
                                                if(element.pos.x > users.pos.x) {
                                                    element.info.move = 'left';
                                                    element.pos.x -= 100;
                                                }
                                                else 
                                                {
                                                    element.info.move = 'right';
                                                    element.pos.x += 100;
                                                }
                                                redis.setBoss(element.id,element);
                                            }
                                        }
                                    }
                                }
                                let rand = users;
                                if(rand)
                                {
                                    
                                    let doxa = Math.abs(element.pos.x - rand.pos.x);
                                    if(doxa <= 500) {
                    
                                    }
                                    else 
                                    {
                                        if(element.pos.x < rand.pos.x)  element.info.move = 'left';
                                        else element.info.move = 'right';
                                        
                                        element.pos.x = rand.pos.x;
                                        if(element.info.move == 'left') element.pos.x += string.rand(10,100);
                                        else element.pos.x -= string.rand(10,100);
                                    }
                                    element.pos.y = rand.pos.y;
                                    redis.setBoss(element.id,element);
                                }
                    
                                io.sendMap({
                                    id : element.id,
                                    x : element.pos.x,
                                    y : element.pos.y,
                                    move : element.info.move,
                                },element,'bossMove');
                            }
                        });
                        
                    }
        
        
                    // xử lý tấn công, di chuyển
                    
                    // xử lý kĩ năng hiệu ứng
                    element = bossEFF(io,element);


                    redis.setBoss(element.id,element);
                    res();
                    
                }
                else
                if(element.info.chiso.hp <=0 && element.tuvong == 0) 
                {
                    element.tuvong = 1;
                    if(infoBOSS.chat.die.length > 0)
                    {
                        let noidung = infoBOSS.chat.die[string.rand(0,infoBOSS.chat.die.length-1)];
                        io.sendMap({
                            _1 : element.id,
                            _2 : noidung,
                            _h : string.rand(1,100),
                        },element)
                    }
                    // nếu boss chết thì tạo ra các boss khác
                    if(infoBOSS.die.length > 0)
                    {
                        infoBOSS.die.forEach(e => {
                            startBoss(io,e,element.pos.map,element.pos.zone);
                        });
        
                    }

                    // lưu vào database
                    if(infoBOSS.hoisinh && infoBOSS.hoisinh >=1) {
                        let time = infoBOSS.hoisinh * 1000 * 60 + Date.now();
                        redis.getBossDie().then(array => {
                            array.push({
                                id : infoBOSS.id,
                                time : time,
                            });
                            redis.setBossDie(array);
                        })
                    }
                    
                    setTimeout(() => {
                        io.sendMap(element.id,element,-86);
                        redis.delBoss(element.id);
                    }, 5000);
        
                    // delete boss 
                    res(true);
                }
                else 
                {
                    res(true);
                }
                
                /* end script */
            });
        })).then(() => {
            setTimeout(() => {
                updateMove(io);
            }
            , 500);

        });

    });

    
}
module.exports = function (io) 
{
    createBot(io);
    updateMove(io)
}