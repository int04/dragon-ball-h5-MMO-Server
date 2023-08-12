let newbang = require('./newbang.js');
let find = require('./find.js');
let me = require('./me.js');
let chat = require('./chat.js');
let xin = require('./xin.js');
let duyet = require('./duyet.js');
let out = require('./out.js');
let phongpho = require('./phongpho.js');
let hachuc = require('./hachuc.js');
let nhuongbang = require('./nhuongbang.js');
let kick = require('./kick.js');
let shop_icon = require('./shop_icon.js');
let moi = require('./moi.js');
module.exports = function(socket,data) 
{
    if(!socket.uid) return false;
    if(typeof data != 'object') return;
    if(data.type == 'create') {
        return newbang(socket,data);
    }
    if(data.type == 'random') 
    {
        return find(socket,data);
    }
    if(data.type == 'me') {
        return me(socket,data);
    }
    if(data.type =='chat') return chat(socket,data);
    if(data.type =='xin') return xin(socket,data);
    if(data.type =='duyet') return duyet(socket,data);
    if(data.type =='out') return out(socket,data);
    if(data.type =='phongpho') return phongpho(socket,data);
    if(data.type =='hachuc') return hachuc(socket,data);
    if(data.type =='nhuongbang') return nhuongbang(socket,data);
    if(data.type =='kick') return kick(socket,data);
    if(data.type =='shop_icon') return shop_icon(socket,data);
    if(data.type =='moi') return moi(socket,data);
    if(data.type == 'leave')
    {
        socket.leave("BANG_"+data.id);
    }
}