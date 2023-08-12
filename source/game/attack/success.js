let skill = require('../../Model/base/skill')
let string = require('../../Model/string')
let quai = require('../../Model/base/quai')

/* Xử lý hậu kì sau khi chết */
let base_boss = require('../../Model/base/boss')

let dieMob = require('./die/mob.js');
let dieBoss = require('./die/dieboss.js');
let diePlayer = require('./die/dieplayer.js');


let redis = require('../../Model/redis.js');

let SnowlyUpdate =async function(socket,data)
{
    if(socket.uid <=0) return false;
    let keyid = data;
    if(!keyid) return false;
    // find all array keyid from donDanh
    

    redis.whereSkill(keyid,'player').then(list => {
        let i = 0;

        let runProcess = function() {
            let element = list[i];
            let from = element.from; // lấy thông tin người đánh
            let to = element.to; // lấy thông tin người chịu đòn
    
            let value = Math.round(element.value); // giá trị tham thiếu
            let type = element.type; // loại đòn +hp, ...


            let find1 = redis.getPlayer(from);
            let find2 = redis.getPlayer(to);

            Promise.all([find1,find2]).then( async res => {
                let infoFrom = res[0];
                let infoTo = res[1];
                let hpFrom = res[2];
                let hpTo = res[3];
                if(infoTo)  // phải tồn tại người chịu đòn
                {
                    if(type == 'congki') 
                    {
                        socket.worker({
                            type : 'player',
                            uid : infoTo.id,
                            object : 'congKi',
                            value : value
                        });
                    }
        
                    if(type == 'conghp') 
                    {
                        socket.worker({
                            type : 'player',
                            uid : infoTo.id,
                            object : 'congHp',
                            value : value
                        });
                    }
                    if(type == 'truhp') 
                    {
                        socket.worker({
                            type : 'player',
                            uid : infoTo.id,
                            object : 'truHp',
                            value : value
                        });
        
                    }
                    if(type == 'truki') 
                    {
                        socket.worker({
                            type : 'player',
                            uid : infoTo.id,
                            object : 'truKi',
                            value : value
                        });
                    }
                    if(type == 'congexp') 
                    {
                        socket.worker({
                            type : 'player',
                            uid : infoTo.id,
                            object : 'congExp',
                            value : value
                        });
                    }

                    if(type == 'chimang') {
                        socket.sendMap({
                            type : 'chimang',
                            uid : infoFrom.id,
                        },'msg')
                    }
                }

                let c = redis.delSkill(element.id);
                Promise.all([c]).then(() => {
                    
                    i++;
                    if(i < list.length) runProcess();
                });
        
            });
        }
        if(list.length >=1) 
        {
            runProcess();
        }
    });



    redis.whereSkill(keyid,'boss').then(lisBOSS => {
        let i = 0;

        let runProcess = function() {
            let element = lisBOSS[i];
            let from = element.from; // lấy thông tin người đánh
            let to = element.to; // lấy thông tin quái
            let value = Math.round(element.value); // giá trị tham thiếu
            let type = element.type; // loại đòn +hp, ...
            let infoTo = redis.getBoss(to);
            let infoFrom = redis.getPlayer(from);

            Promise.all([infoTo,infoFrom]).then(res => {
                let infoTo = res[0];
                let infoFrom = res[1];
                let infoMob = base_boss.find(e => e.id == infoTo.uid);

                if(infoTo && infoFrom)  // phải tồn tại người chịu đòn
                {
                    if(type == 'truhp') 
                    {
                    
                        if(infoTo.info.chiso.hp- value <=0 && infoTo.info.chiso.hp > 0) {
                            dieBoss(socket,infoFrom,infoMob);
                        } 
        
                        infoTo.info.chiso.hp -= value;
                        if(infoTo.info.chiso.hp <=0) infoTo.info.chiso.hp = 0;
                    }
                    
                    // add victim
                    if(infoTo.victim.indexOf(from) == -1) infoTo.victim.push(from);

                    // update
                    let a = redis.setBoss(infoTo.id,infoTo);
                    let c = redis.delSkill(element.id);
                    Promise.all([a,c]).then(xxx => {
                        socket.sendMap({
                            _1 : from,
                            _2 : to,
                            _3 : value,
                            _4 : type,
                            _5 : {
                                hp : infoFrom.info.chiso.hp,
                                ki : infoFrom.info.chiso.ki,
                                kiFull : infoFrom.info.chiso.kiFull,
                                hpFull : infoFrom.info.chiso.hpFull,
                                sucmanh : infoFrom.info.coban.sucmanh,
                                tiemnang : infoFrom.info.coban.tiemnang,
                            }, 
                            _6 : {
                                hp : infoTo.info.chiso.hp,
                                ki : infoTo.info.chiso.ki,
                                kiFull : infoTo.info.chiso.kiFull,
                                hpFull : infoTo.info.chiso.hpFull,
                                sucmanh : infoTo.info.coban.sucmanh,
                                tiemnang : infoTo.info.coban.tiemnang,
                            },
                            _e : string.rand(1,100),
                        });
                        i++;
                        if(i < lisBOSS.length) runProcess();
                    });
                }

            });
        };

        if(lisBOSS.length >=1) 
        {
            runProcess();
        }
    });


 

    redis.whereSkill(keyid,'mob').then(lisMob => {
        if(lisMob.length >=1) {

            let i = 0;

            let runProcess = function() {
                let element = lisMob[i];
                let from = element.from; // lấy thông tin người đánh
                let to = element.to; // lấy thông tin quái
                let value = Math.round(element.value); // giá trị tham thiếu
                let type = element.type; // loại đòn +hp, ...
                let infoTo = redis.getMob(to);
                let infoFrom = redis.getPlayer(from);
    
                Promise.all([infoTo,infoFrom]).then(res => {
                    let infoTo = res[0];
                    let infoFrom = res[1];
                    console.log('Thực hiện',i,infoTo.info.chiso.hp)
    
                    let infoMob = quai.find(e => e.id == infoTo.uid);
                    if(infoTo && infoMob)  // phải tồn tại người chịu đòn
                    {
                        
                        if(type == 'truhp') 
                        {
                            // tính exp
                            if(value >= 1)
                            {
                                let stgayra = Math.round(value/infoTo.info.chiso.hp*100);
                                stgayra = stgayra > 100 ? 100 : stgayra;
                                let expFull = infoTo.exp;
                                let chiso = [0,1.5,2.0,3.0]; // namek, trái đất, saiyan
                                if(infoTo.info && infoTo.info.coban.sieuquai && infoTo.info.coban.sieuquai != -1) {
                                    expFull = Math.round(expFull*chiso[infoTo.info.coban.sieuquai]);
                                }
                                if(expFull && expFull >=1)
                                {
                                    let exp = Math.round(expFull/100*stgayra);
                                    let exp_to = string.rand(exp,exp/100*105);
                                    exp_to = Math.round(exp_to);
                                    exp_to = exp_to > expFull ? expFull : exp_to;
                                    exp_to = exp_to <=0 ? 1 : exp_to;
                                    if(exp_to >=1)
                                    {
                                        infoTo.exp -= exp_to;
                                        let expNhan = exp_to;
                                        socket.worker({
                                            type : 'player',
                                            uid : infoFrom.id,
                                            object : 'congExp',
                                            value : expNhan
                                        });

                                    }
            
                                }
                            }
            
                            // kết liễu 
                            if(infoTo.info.chiso.hp- value <=0 && infoTo.info.chiso.hp > 0) {
                                infoFrom = dieMob(socket,infoFrom,infoTo);
                            } 
            
                            infoTo.info.chiso.hp -= value;
                            if(infoTo.info.chiso.hp <=0) infoTo.info.chiso.hp = 0;
                        }
                        
            
                        // add victim
                        if(infoTo.victim.indexOf(from) == -1) infoTo.victim.push(from);
    
                        // update  
                        let a = redis.setMob(infoTo.id,infoTo);
                        let c = redis.delSkill(element.id);
                        Promise.all([a,c]).then(data => {
                            socket.sendMap({
                                _1 : null,
                                _2 : to,
                                _3 : value,
                                _4 : type,
                                _5 : {
                                    
                                }, 
                                _6 : {
                                    hp : infoTo.info.chiso.hp,
                                    ki : infoTo.info.chiso.ki,
                                    kiFull : infoTo.info.chiso.kiFull,
                                    hpFull : infoTo.info.chiso.hpFull,
                                    sucmanh : infoTo.info.coban.sucmanh,
                                    tiemnang : infoTo.info.coban.tiemnang,
                                },
                                _e : string.rand(1,100),
                            });

                            i++;
                            if(i < lisMob.length) runProcess();

                        });
                    }
                });
            }

            runProcess();

        };
    })

   


}


module.exports = function(socket,data) 
{
    SnowlyUpdate(socket,data);
}
