# Dragon Ball Online Server

1. Introduction
   - This is the server file for the game.
   - You can download the client here:
     + Github: https://github.com/int04/dragon-ball-h5-MMO

2. Source code and requirements
   - **Cluster**
   - **Nodejs**
   - **Redis**
     + Used to store temporary player data.
   - **Mysql**
     + Used for long-term data storage.
   - The communication protocol with the client uses socket.io.
   - Additionally, the **Cluster** system has been implemented to optimize the server's performance with the system's resources. It helps handle a large number of players.
   - The system shares communication between CPU and RAM with different pidIDs.

3. Installation
   - Make sure your system has **Nodejs**, **Redis**, and **MySql** installed.
   - Run `npm install i`.
   - Open the **.env** file to configure the MySql parameters.
   - Upload the **database.sql** file to MySql.
   - Run `Node server.js`.
   - Enter the game to experience it.

4. Contribution and license
   - Open-source code, no license, anyone with this source code can use it.
   - The server is written by **int04**.
     + Github: https://github.com/int04

5. References
   - Redis: https://redis.io
   - Nodejs: https://nodejs.org
