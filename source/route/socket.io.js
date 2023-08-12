let thoat                           =           require('../../source/game/login/thoat.js');
let msg                             =           require('../../source/game/msg.js');
let string                          =           require('../../source/Model/string.js');
let CreteFunction                   =           require('./socket.io/createFunction.js');
module.exports = function(io) {
    io.on('connection', (socket) => {

        socket = CreteFunction(socket);

        msg(socket);

        socket.on('disconnect', () => {
            thoat(socket)
            console.log(`close:# ${process.pid} - IO.ID: ${socket.id}`);
        });
        
    });
}