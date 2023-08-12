/**
 * @since04
 */

let cluster                         =           require("cluster");
let http                            =           require("http");
let {Server}                        =           require("socket.io");
let {setupWorker}                   =           require("@socket.io/sticky");
let {createAdapter}                 =           require("@socket.io/cluster-adapter");

let customParser                    =           require('socket.io-msgpack-parser');
let express                         =           require('express');
let app                             =           express();


/* ############################        PROCESS                             ################################ */

const httpServer = http.createServer(app);

let io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true,
        compression: true,
    },
    allowEIO3: true,
    parser: customParser,
});

io.adapter(createAdapter());

setupWorker(io);

require('../../source/api/route.js')(app, io);


if (cluster.worker.id == 1) {
    require('../../source/server/mob.js')(io);
}

require('./socket.io.js')(io);

require('../../source/server/OOP.js')(io);
require('../../source/server/work.js')(io);

console.log('Worker ' + cluster.worker.id + ' ON, processID is: ' + cluster.worker.process.pid);


module.exports = {};