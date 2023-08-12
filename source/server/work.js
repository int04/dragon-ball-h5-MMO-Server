let bossAttack = require('./work/bossAttack.js');
let mobAttack = require('./work/mobAttack.js');
let playerRoute = require('./work/playerRoute.js');
let banghoi = require('./work/banghoi.js');
let eff = require('./work/eff.js');
let giaodich = require('./work/giaodich.js');
let outgame = require('./work/outlogin.js');
let main = function(io,data) 
{
    if(data.type == 'boss_attack') bossAttack(io,data)
    if(data.type == 'mob_attack') mobAttack(io,data)
    if(data.type == 'player') playerRoute(io,data)
    if(data.type == 'banghoi') banghoi(io,data)
    if(data.type == 'eff') eff(io,data)
    if(data.type == 'giaodich') giaodich(io,data)
    if(data.type == 'out') outgame(io,data)
}


module.exports = function(io) 
{
    process.on("message", (msg) => {
        if(msg.since04)
        {
           // console.log(`#${process.pid} nhận: ${JSON.stringify(msg.since04)}`);
            return main(io,msg.since04);
        }
    });

    let port = process.env.PORT;
}