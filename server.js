/**
 * @since04
 * @description: server game Dragon Ball Online
 */



require('dotenv').config();


/**
 * @description: Khai báo các module cần thiết
 * @cache: là một trong những gói cũ tôi từng viết. Tôi từng nghĩ rằng, chỉ cần chạy trên mảng là đủ. Nhưng tôi đã sai. Bởi nếu chạy trên mảng, nó sẽ không thể chạy trên nhiều core CPU khác nhau. Chính bởi vậy, tôi đã phát triển một hệ thống phân tán, và sử dụng redis để lưu trữ dữ liệu. Nhưng, do tôi là một người khá lười, nên tôi đã không viết lại code. Tôi chỉ đơn giản là sử dụng lại code cũ, và chỉnh sửa một số chỗ nhỏ. Chính vì vậy, một số đoạn code cũ vẫn còn tồn tại trong trò chơi này.
 */

require('./source/route/cache.js');



require('./source/route/cluster.js');

