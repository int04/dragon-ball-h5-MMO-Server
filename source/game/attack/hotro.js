let skill = require('../../Model/base/skill')
let string = require('../../Model/string')
let quai = require('../../Model/base/quai')
let redis = require('../../Model/redis.js');
let success = require('./success.js');
let checkAttackPlayer = require('./player.js');


// import skil;
let cuu = require('./skill/cuu.js');
const ttnl = require('./skill/ttnl');
const hoakhi = require('./skill/hoakhi');
const tdhs = require('./skill/tdhs');
const knl = require('./skill/knl');
const masenko = require('./skill/masenko');
const boom = require('./skill/boom');

module.exports = async function(socket,data) 
{
    if(socket.uid >=1) 
    {
        let idskill = data._1 >> 0; // id kĩ năng
        if(!idskill) return console.log('Không tìm thấy kĩ năng'); // không tìm thấy kĩ năng
        let mucTieu = data._2; // mục tiêu
        let OOP = data._3; // player, boss...

        let mucTieuType;
        if(OOP == 1) mucTieuType = 'mob';
        if(OOP == 2) mucTieuType = 'player';
        if(OOP == 3) mucTieuType = 'boss';

        let my = {};
        my = socket.my;
        my.eff = string.eff(my.eff);

        let choang = string.choang();
        let bichoang = 0;
        choang.forEach(element => {
            if(my.eff[element] && my.eff[element].active == true ) bichoang = 1;
        });
        if(bichoang == 1) return string.bug('không thể thực hiện');

        if(!my) return console.log('Không tìm thấy bản thân'); // không tìm thấy được bản thân

        if(my.info.chiso.hp <=0) return console.log('Hết máu rồi'); // hết máu rồi

        let data_skill = skill.find(e => e.id == idskill); // lấy thông tin kĩ năng
        if(!data_skill) return console.log('Không tìm thấy kĩ năng'); // không tìm thấy kĩ năng
        let getMySkill = my.skill.find(e => e.id == idskill); // lấy thông tin kĩ năng của bản thân
        if(!getMySkill) return console.log('Không tìm thấy kĩ năng bản thân'); // không tìm thấy kĩ năng của bản thân
        let getMySkillLevel = getMySkill.level; // lấy level kĩ năng của bản thân
        if(getMySkill.time >= Date.now()) return console.log('Kĩ năng chưa hồi phục'); // chưa hồi kĩ năng
        let ki = 0;

        if(data_skill.type != 'buff') return console.log('không phải kĩ năng hỗ trợ'); // nếu không phải skill buff

        let sql = null;

        if(data_skill.need && data_skill.need == true) 
        {
            if(!mucTieuType) return console.log('Chưa thẻ tìm được loại đối tượng xác định ');
            if(!mucTieu) return console.log('Chưa có đối tượng');

            if(mucTieuType == 'player') sql = await redis.getPlayer(mucTieu);
            if(mucTieuType == 'mob') sql = await redis.getMob(mucTieu);
            if(mucTieuType == 'boss') sql = await redis.getBoss(mucTieu);

            if(!sql) return console.log('Không tìm thấy bất kì đối tượng nào user chọn'); 


            if(data_skill.to && data_skill.to == 'player' && (sql.type == 'mob' || sql.type == 'boss')) return console.log('Kĩ năng chỉ dùng được đối với player');
            
            if(data_skill.to && data_skill.to == 'player' && sql.type == 'player' && data_skill.id != 9 ) 
            {
                let checked = await checkAttackPlayer(my,sql);
                if(!checked) return console.log('Không thể đánh'); // không thể đánh
            }

            if(sql.type == 'player' && data_skill.id != 9) {
                let checked = await checkAttackPlayer(my,sql);
                if(!checked) return console.log('Không thể đánh line 81'); // không thể đánh
            }

            if(sql.pos.map != my.pos.map || sql.pos.zone != my.pos.zone) return console.log('Không cùng bản đồ'); // không thể đánh

        }
        if(sql != null) 
        {
            sql.eff = string.eff(sql.eff);
        }

        if(getMySkillLevel <=0) return console.log('Kĩ năng chưa học'); // kĩ năng chưa học


        if(data_skill.kit == 1) ki = data_skill.ki[getMySkillLevel]; // tính ki trừ bình thường
        if(data_skill.kit == 2) ki =  my.info.chiso.kiFull/ 100 *   data_skill.ki[getMySkillLevel] ; // kĩ năng ki trừ theo %
        if(my.info.chiso.ki < ki) return console.log('Không đủ KI để hồi phục'); // ki không đủ
        getMySkill.time = Date.now()+ data_skill.time[getMySkillLevel] * 1000; // set thời gian hồi kĩ năng
        getMySkill.lasttime = Date.now();

        socket.emit('2b',data_skill.id,data_skill.time[getMySkillLevel]);

        let keyid = string.az(10); // tạo keyid

        if(ki > 0) 
        {
            let redisID = string.az(10);
            let msg = {
                id : redisID,
                keyid : redisID,
                from : socket.uid, // nguyên nhân
                to : socket.uid, // đối tượng trực tiếp trừ
                value : ki,
                type : 'truki',
                loai : 'player' // đối tượng nhận
            };
            redis.setSkill(msg).then(() => {
                success(socket,redisID);
            })
        }

        if(data_skill.id == 9) 
        {
            cuu(socket,data_skill,getMySkillLevel);
        }

        

        if(data_skill.id == 8) 
        {
            // tái tạo năng lượng
            ttnl(socket,data_skill)
        }

        if(data_skill.id == 11) 
        {
            // hoá khỉ
            hoakhi(socket,data_skill,getMySkillLevel);
        }

        if(data_skill.id == 3) 
        {
            tdhs(socket,data_skill,getMySkillLevel);

        }

        if(data_skill.id == 13)
        {
            // khiêng năng lượng
            knl(socket,data_skill,getMySkillLevel);
        }

        if(data_skill.id == 14)
        {
            // ru ngủ
            let time = data_skill.dame[getMySkillLevel];
            sql.eff = string.eff(sql.eff);
            sql.eff.rungu.time = Date.now() + time * 1000;
            sql.eff.rungu.active = true;

            if(sql.type == 'player') 
            {
                socket.worker({
                    type : 'eff',
                    name : 'rungu',
                    uid : sql.id,
                    time : time,
                })
                return false;
            }
            else if(sql.type == 'mob')
            {
                redis.setMob(sql);
            }
            else if(sql.type == 'boss')
            {
                redis.setBoss(sql);
            }

            socket.sendMap({
                eff : [{id : sql.id, eff : sql.eff}],
            })


            
        }

        if(data_skill.id == 12)
        {
            /* Masenko */
            masenko(socket,data_skill,getMySkillLevel,sql);
        }

        if(data_skill.id == 10) 
        {
            // Tự phát nổ
            boom(socket,data_skill,getMySkillLevel);

        }
    }
}