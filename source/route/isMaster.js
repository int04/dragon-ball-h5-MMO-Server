/**
 * @since04
 */

let cluster                         =           require("cluster");
let http                            =           require("http");
let numCPUs                         =           require("os").cpus().length;
let {setupMaster, setupWorker}      =           require("@socket.io/sticky");
let {createAdapter, setupPrimary}   =           require("@socket.io/cluster-adapter");

let express                         =           require('express');
let app                             =           express();


/* ############################        PROCESS                             ################################ */

let httpServer = http.createServer(app);

setupMaster(httpServer, {loadBalancingMethod: "least-connection"});

setupPrimary();

cluster.setupMaster({serialization: "advanced"});

httpServer.listen(process.env.PORT);

for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
}

cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`,worker.id);
    let newWorker = cluster.fork();
});

cluster.on("message", (worker, msg) => {
    if(msg.since04)
    {
        //console.log(`main ${process.pid} nhận từ ${worker.process.pid}: ${JSON.stringify(msg)}`);
        for (const id in cluster.workers) {
            cluster.workers[id].send(msg);

        }

    }
});

module.exports = {};
