let mysqli = require('../../Model/mysqli.js');
let string = require('../../Model/string.js');

let sendtoClient = function(socket,data) 
{
    let list = [];
    data.forEach(e=>{
        e.info = JSON.parse(e.info);
        e.menber = JSON.parse(e.menber);
        e.info.name = e.name;
        e.info.timeVI = string.coverTime(e.info.time);
        e.menber.forEach(e2=>{
            e2.timeVI = string.coverTime(e2.time);
        });
        list.push(e);
    });
    socket.send(list,'ngaunhienbanghoi');
}

module.exports = function(socket,data) 
{
    let name = data.name;
    let my = socket.my;
    if(!my) return socket.noti("Không tìm thấy nhân vật.");


    // if name <=0 random or where
    let sql = "";
    if(name.length <=0) sql = `SELECT * FROM banghoi ORDER BY RAND() LIMIT 20`;

    if(name.length <=0) 
    {
        mysqli.query(sql, (error, results) => {
            if(error) {
                socket.noti('Có lỗi xẩy ra. Mã #find_random')
            }
            else {
                sendtoClient(socket,results);
            }
        });
    }
    else 
    {
        const sql = 'SELECT * FROM banghoi WHERE name LIKE ? LIMIT 20';
        const searchTerm = `%${name}%`;
        mysqli.query(sql, [searchTerm], (error, results) => {
            if(error) {
                socket.noti('Có lỗi xẩy ra. Mã #find_like')
            }
            else {
                sendtoClient(socket,results);
            }
        });
    }

}