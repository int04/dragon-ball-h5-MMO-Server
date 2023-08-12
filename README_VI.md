# Chú bé rồng Online Server

1. Giới thiệu
    - Đây là tệp máy chủ của trò chơi.
    - Bạn có thể tải máy khách (client) tại đây:
        + Github: https://github.com/int04/dragon-ball-h5-MMO


2. Về mã nguồn, yêu cầu
    - **Cluster**
    - **Nodejs**
    - **Redis**
        + Sử dụng để lưu các dữ liệu tạm thời của người chơi.
    - **Mysql**
        + Sử dụng để lưu trữ dữ liệu lâu dài
    - Giao thức giao tiếp với máy khách sử dụng socket.io
    - Ngoài ra, đã sử dụng thêm hệ thống **Cluster** để tối ưu hóa trải nghiệm của máy chủ với tài nguyên của hệ thống. Giúp chịu tải hệ thống người chơi lớn.
    - Hệ thống chia sẻ các giao tiếp giữa các pidID CPU và RAM.
    
3. Cài đặt
    - Đảm bảo hệ thống của bạn đã cài đặt **Nodejs**, **Redis** và **MySql**
    - `npm install i`
    - Mở tệp **.env** cấu hình các thông số Mysql
    - Tải tệp **database.sql** lên Mysql.
    - `Node server.js`
    - Vào trò chơi để trải nghiệm.

4. Đóng góp, giấy phép
    - Mã nguồn mở, không có giấy phép, bất kì ai có mã nguồn này đều có thể sử dụng.
    - Máy chủ được viết bởi **int04**
        + Github : https://github.com/int04

5. Tham khảo
    - Redis: redis.io
    - Nodejs: nodejs.org