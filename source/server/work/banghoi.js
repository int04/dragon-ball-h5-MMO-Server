let getMy = require('./getMy.js');
let string = require('../../Model/string.js');
let redis = require('../../Model/redis.js');

let me = require('../../game/bang/me.js')

let setSkin = async function(socket,data) {
    let my = socket.my;
    my.skin = data.skin;
    me(socket,{type : 'me'});

};

module.exports = function(io, data) {
    let socket = getMy(io,data.uid);
    if(!socket) return false;
    if(socket.uid <=0) return false;
    if(data.action == 'set') setSkin(socket,data);

}