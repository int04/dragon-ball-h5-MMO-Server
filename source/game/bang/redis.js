
let redis = require('../../Model/redis.js');
let client = redis.client;

let getChatBang = function(bangid) {
    return new Promise((resolve, reject) => {
        client.get('chatbang:' + bangid).then(result => {
            if(!result) return resolve([]);
            result = JSON.parse(result);
            resolve(result);
        });
    });

}

let setChatBang = function(bangid, data) {
    return new Promise((resolve, reject) => {
        client.set('chatbang:' + bangid, JSON.stringify(data)).then(result => {
            resolve(result);
        });
    });
}

// kiểm tra xem có lời xin không
let ptXin = function (bangid,uid) {
    return new Promise((resolve, reject) => {
        client.get('ptxin:' + bangid + ':' + uid).then(result => {
            resolve(result);
        });
    });
}

// xoá lời mời xin của users
let deletePTxin = function (bangid,uid) {
    return new Promise((resolve, reject) => {
        client.del('ptxin:' + bangid + ':' + uid).then(result => {
            resolve(result);
        });
    });
}

let deleteAllPTXinUsers = function (uid) {
    return new Promise((resolve, reject) => {
        client.keys('ptxin:*:' + uid).then(result => {
            let array = [];
            for(let i = 0; i < result.length; i++) {
                array.push(result[i]);
            }
            Promise.all(array).then(result => {
                let array = [];
                for(let i = 0; i < result.length; i++) {
                    array.push(result[i]);
                }
                Promise.all(array.map(e => {
                    return new Promise((resolve, reject) => {
                        client.del(e).then(result => {
                            resolve(result);
                        });
                    });
                }
                )).then(result => {
                    resolve(result);
                }
                );

            }
            );
        });
    });
}

let setPTxin = function (bangid,uid,data) {
    return new Promise((resolve, reject) => {
        client.set('ptxin:' + bangid + ':' + uid, JSON.stringify(data) ).then(result => {
            resolve(result);
        });
    });
}

let delete_pt_xin_het_thoi_gian = function() {
    return new Promise((resolve, reject) => {
        client.keys('ptxin:*:*', ).then(result => { 
            let array = [];
            for(let i = 0; i < result.length; i++) {
                array.push(result[i]);
            }
            Promise.all(array.map(e => {
                return new Promise((resolve, reject) => {
                    client.get(e).then(result => {
                        result = JSON.parse(result);
                        if(result.time+ (60*60*12*1000) < Date.now()) {
                            client.del(e).then(result => {
                                resolve(result);
                            });
                        }
                    });
                });
            }
            )).then(result => {
                resolve(result);
            }
            );
        });
    });
}

let getListXin = function (bangid) {
    return new Promise((resolve, reject) => {
        client.keys('ptxin:' + bangid + ':*').then(result => {
            let array = [];
            for(let i = 0; i < result.length; i++) {
                array.push(result[i]);
            }
            Promise.all(array).then(result => {
                let array = [];
                for(let i = 0; i < result.length; i++) {
                    array.push(result[i]);
                }
                Promise.all(array.map(e => {
                    return new Promise((resolve, reject) => {
                        client.get(e).then(result => {
                            result = JSON.parse(result);
                            resolve(result);
                        });
                    });
                }
                )).then(result => {
                    resolve(result);
                }
                );

            });
        });
    });
}




let setPT_moi = function (bangid,uid) {
    return new Promise((resolve, reject) => {
        client.set('ptmoi:' + bangid + ':' + uid, Date.now() + 12*60*60*1000 ).then(result => {
            resolve(result);
        });
    });
}
let delete_pt_moi_het_thoi_gian = function() {
    return new Promise((resolve, reject) => {
        client.keys('ptmoi:*:*', ).then(result => {
            let array = [];
            for(let i = 0; i < result.length; i++) {
                array.push(result[i]);
            }
            Promise.all(array.map(e => {
                return new Promise((resolve, reject) => {
                    client.get(e).then(result => {
                        if(result < Date.now()) {
                            client.del(e).then(result => {
                                resolve(result);
                            });
                        }
                    });
                });
            }
            )).then(result => {
                resolve(result);
            }
            );
        });
    });
}

let getPT_moi = function (bangid,uid) {
    return new Promise((resolve, reject) => {
        client.get('ptmoi:' + bangid + ':' + uid).then(result => {
            resolve(result);
        });
    });
}

let deletePTMoiALLUID = function (uid) {
    return new Promise((resolve, reject) => {
        client.keys('ptmoi:*:' + uid).then(result => {
            let array = [];
            for(let i = 0; i < result.length; i++) {
                array.push(result[i]);
            }
            Promise.all(array).then(result => {
                let array = [];
                for(let i = 0; i < result.length; i++) {
                    array.push(result[i]);
                }
                Promise.all(array.map(e => {
                    return new Promise((resolve, reject) => {
                        client.del(e).then(result => {
                            resolve(result);
                        });
                    });
                }
                )).then(result => {
                    resolve(result);
                }
                );

            }
            );
            
        });
    });
}

let deleteMoi = function (bangid,uid) {
    return new Promise((resolve, reject) => {
        client.del('ptmoi:' + bangid + ':' + uid).then(result => {
            resolve(result);
        });
    });
}



    





module.exports = {
    getChat : getChatBang,
    getChatBang : getChatBang,
    setChatBang : setChatBang,
    ptXin : ptXin,
    deletePTxin : deletePTxin,
    deleteAllPTXinUsers : deleteAllPTXinUsers,
    setPTxin : setPTxin,
    delete_pt_xin_het_thoi_gian : delete_pt_xin_het_thoi_gian,
    setPT_moi : setPT_moi,
    delete_pt_moi_het_thoi_gian : delete_pt_moi_het_thoi_gian,
    getPT_moi : getPT_moi,
    deletePTMoiALLUID : deletePTMoiALLUID,
    deleteMoi : deleteMoi,

    getListXin : getListXin,

    getPlayer : redis.getPlayer,
    setPlayer : redis.setPlayer,




}