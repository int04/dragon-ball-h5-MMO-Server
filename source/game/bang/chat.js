let string = require('../../Model/string.js');
let redis = require('./redis.js');

module.exports = async function(socket,data)
{
    if(socket.uid <=0) return false;
    let my = socket.my;
    if(!my) return false;
    let text = data.value;
    if(!text) return false;
    if(text.length > 300) return socket.chipi("tối đa 300 kí tự");
    if(text.length < 1) return false;
    let bang = my.skin.bangID;
    if(!bang) return false;

    let chatPT = await redis.getChatBang(bang);
    if(typeof chatPT != 'object') chatPT = [];
    
    let result = {
        name : my.name,
        text : text,
        time : Date.now(),
        avatar : my.info.coban.avatar,
        sucmanh : my.info.coban.sucmanh,
        skin : my.skin,
        uid : my.id,
        bang : bang,
    };
    chatPT.push(result);
    // if bang cout > 20 chat, delete first chat
    if(chatPT.filter(e=>e.bang == bang).length > 20) chatPT.shift();
    socket.sendPT(result,'chatPT');
    redis.setChatBang(bang,chatPT);
}  