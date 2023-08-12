let redis = require('../Model/redis.js');


let client = redis.client;

let deleteItem = function(io) {
    let time = Date.now();
    client.keys('item:*').then(data => {
        let array = [];
        for(let i =0; i< data.length; i++)
        {
            array.push(client.get(data[i]));
        }
        Promise.all(array).then(data => {
            
            Promise.all(data.map((e,index) => {

                return new Promise((resolve,reject) => {
                    let item = JSON.parse(e);
                    if(item && item.time_dat <= Date.now())
                    {
                        io.sendMap(item.id,item,-86);
                        console.log('Xóa vật phẩm',item.id,'do hết thời gian','map:',item.pos.map,'zone',item.pos.zone);
                        redis.delItem(item.id).then((x) => {
                            resolve(true);
                        }
                        )
                    }
                    else
                    {
                        resolve(true);
                    }
                });


            })).then(() => {
                //console.log('time delete item',Date.now() - time,'ms');
                setTimeout(() => {
                    deleteItem(io)
                },1000);
            }
            )
            
        })
    });
}
 
module.exports = function(io) 
{
    deleteItem(io)
}