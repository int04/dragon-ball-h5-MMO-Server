/**
 * @since04
 * @param {object} io
 * @desc: phân tán CPU trò chơi.
 */


/**
 * @since04
 *                                     Cấu hình các hệ thống cluster
 *                      #####################################################################
 */

let cluster                         =           require("cluster");
/**
 * @since04
 * @desc: start server
 */

if(cluster.isMaster)
{
    require('./isMaster.js');
}
else 
{
    require('./isWork.js');
}

module.exports = {};