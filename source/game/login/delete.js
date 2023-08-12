let string = require('../../Model/string.js');
let db = require('../giaodich/giaodich.js');
module.exports = async function(id) {
    let giaodich = await db.getGiaodich();
    giaodich.moi = giaodich.moi.filter(e => e.from != id && e.to != id);
    giaodich.dang = giaodich.dang.filter(e => e.from != id && e.to != id);
    await db.setGiaodich(giaodich);
    
}