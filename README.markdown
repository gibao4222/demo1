# Demo1 - Ứng dụng Quản lý Playlist Nhạc 🎵

Chào mừng đến với **Demo1**, một ứng dụng web được xây dựng bằng React và Django REST Framework. Dự án này cho phép người dùng tạo, quản lý và thưởng thức các danh sách phát nhạc với các tính năng như xác thực người dùng, tạo playlist, và tạo playlist thông minh bằng AI. Nó tích hợp với dữ liệu người dùng để mang đến trải nghiệm cá nhân hóa.

## 📸 Ảnh Demo
Dưới đây là giao diện của ứng dụng Demo1:
![Giao diện Demo1](https://github.com/gibao4222/demo1/blob/main/frontend/public/demo/Screenshot_demo.png)

## 🚀 Tính năng

- **Xác thực Người dùng**: Đăng nhập/đăng xuất an toàn với các phương thức bao gồm:
  - Đăng nhập bằng tài khoản Facebook.
  - Đăng nhập bằng tài khoản Google.
  - Xác thực 2 yếu tố (2FA) bằng Google Authenticator để tăng cường bảo mật.
- **Quản lý Playlist**: Tạo, cập nhật và xóa playlist dành riêng cho từng người dùng Spotify.
- **Tạo Playlist AI**: Tạo danh sách phát thông minh dựa trên gợi ý của AI.
- **Giao diện Đáp ứng**: Xây dựng với React để mang lại trải nghiệm người dùng mượt mà và tương tác.
- **Giao diện Đáp ứng**: Xây dựng với React để mang lại trải nghiệm người dùng mượt mà và tương tác.
- **Nhắn tin giữa các Người dùng**: Cho phép người dùng trao đổi tin nhắn trực tiếp trong ứng dụng.

## 🛠️ Công nghệ Sử dụng

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Django REST Framework (dựa trên các endpoint API)
- **Cơ sở dữ liệu**: MySQL
- **Xác thực**: JWT (JSON Web Tokens) cho phiên làm việc an toàn, tích hợp OAuth 2.0 cho đăng nhập Facebook/Google, Google Authenticator cho 2FA
- **Khác**: Git cho quản lý phiên bản, GitHub để lưu trữ

## 📦 Hướng dẫn Cài đặt

Hãy làm theo các bước sau để thiết lập dự án trên máy tính cá nhân:

### Điều kiện tiên quyết
- Node.js (18.20.8)
- Python (3.12.3)
- Git
- OpenSSL (để tạo chứng chỉ tự ký)
- Nginx
- MySQL Server
- Google Authenticator (để cài đặt xác thực 2 bước)

### Các bước

1. **Cloning Repository**:
   ```bash
   git clone https://github.com/gibao4222/demo1.git
   cd demo1
   python -m venv venv
   source venv/bin/activate  # Trên Windows: venv\Scripts\activate
   ```

2. **Cài đặt Phụ thuộc Frontend**:
   ```bash
   cd frontend/
   npm install
   ```
3. **Thiết lập MySQL**:
   - Cài đặt MySQL Server:
   ```bash
      sudo apt update
      sudo apt install mysql-server
   ```
   - Khởi động MySQL và cấu hình root password:
   ```bash
   sudo mysql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'your_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```
   - Tạo cơ sở dữ liệu cho dự án:
   ```bash
   mysql -u root -p
   CREATE DATABASE demo1_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```
   - Cập nhật file cấu hình backend (ví dụ: settings.py trong Django) với thông tin kết nối MySQL:
   ```bash
      DATABASES = {
         'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'demo1_db',
            'USER': 'root',
            'PASSWORD': 'your_password',
            'HOST': 'localhost',
            'PORT': '3306',
         }
      }
   ```

4. **Thiết lập Backend (nếu có)**:
   - Nếu bạn sử dụng backend Django, tạo môi trường ảo và cài đặt phụ thuộc:
     ```bash
     cd backend/
     pip install -r requirements.txt
     ```
   - Chạy migration và khởi động server backend:
     ```bash
     python manage.py migrate
     python manage.py runserver
     ```

5. **Cấu hình Đăng nhập Facebook/Google**:
   - Đăng ký ứng dụng trên Facebook Developer Portal và Google Cloud Console để lấy Client ID và Client Secret.
   - Cập nhật các thông tin này trong file .env.
   
6. **Cài đặt Google Authenticator**:
   - Tải ứng dụng Google Authenticator từ Google Play Store hoặc App Store.
   - Trong phần cài đặt bảo mật của ứng dụng, quét mã QR được cung cấp khi bật tính năng Xác minh 2 bước.

7. **Tạo chứng chỉ Tự ký**:
   - Chuyển đến thư mục backend (ví dụ: /var/www/demo1/backend):
      ```bash
      cd backend
      ```
   - Tạo chứng chỉ tự ký bằng OpenSSL:
      ```bash
      openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost+1-key.pem -out localhost+1.pem -subj "/CN=localhost"
      ```
   - Kết quả sẽ tạo ra hai file: localhost+1.pem (chứng chỉ) và localhost+1-key.pem (khóa riêng).
8. **Cài đặt và Cấu hình Nginx**:
   - Cài đặt Nginx:
      ```bash
      sudo apt update
      sudo apt install nginx
      ```
   - Tạo file cấu hình cho Nginx tại /etc/nginx/sites-available/demo1_backend với nội dung sau:
      ```bash
      server {
         listen 443 ssl;
         server_name localhost 127.0.0.1;

         # Đường dẫn đến chứng chỉ tự ký
         ssl_certificate /var/www/demo1/backend/localhost+1.pem;
         ssl_certificate_key /var/www/demo1/backend/localhost+1-key.pem;

         # Tăng giới hạn kích thước yêu cầu
         client_max_body_size 50M;

         location / {
            proxy_pass http://127.0.0.1:8000;  # Django chạy trên port 8000
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
         }
         
         location /ws/ {
            # Thêm cấu hình CORS (dù WebSocket không cần CORS, nhưng để đồng bộ)
            add_header 'Access-Control-Allow-Origin' 'https://localhost:3000' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

            proxy_pass http://127.0.0.1:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
         }
      }
      
      # Chuyển hướng HTTP sang HTTPS (tùy chọn)
      server {
         listen 80;
         server_name localhost 127.0.0.1;
         return 301 https://$host$request_uri;
      }
      ```
   - Kích hoạt file cấu hình:
      ```bash
      sudo ln -s /etc/nginx/sites-available/demo1_backend /etc/nginx/sites-enabled/
      ```
   - Kiểm tra cấu hình và khởi động lại Nginx:
      ```bash
      sudo nginx -t
      sudo systemctl restart nginx
      ```

9. **Chạy Backend**:
   - Chạy dự án Backend với câu lệnh:
      ```bash
         daphne -b 0.0.0.0 -p 8000 myproject.asgi:application
      ```
   - Ứng dụng sẽ chạy tại https://localhost (có thể cần chấp nhận chứng chỉ tự ký trong trình duyệt).

10. **Chạy Frontend**:
   - Cập nhật file cấu hình frontend (nếu cần) để sử dụng HTTPS với localhost:
      ```bash
      npm start
      ```
   - Ứng dụng sẽ chạy tại https://localhost:3000 (có thể cần chấp nhận chứng chỉ tự ký trong trình duyệt).

## 📖 Hướng dẫn Sử dụng

1. **Đăng nhập**: 
   - Sử dụng tài khoản Facebook hoặc Google để đăng nhập nhanh chóng.
   - Bật xác thực 2 bước bằng Google Authenticator để bảo mật thêm.
2. **Tạo Playlist**: Sử dụng nút "Tạo" trong thanh bên để tạo playlist mới hoặc playlist AI.
3. **Nhắn tin**: Truy cập phần tin nhắn để gửi và nhận tin nhắn với các người dùng khác trong ứng dụng
4. **Thêm Bài hát**: Thêm hoặc xóa bài hát khỏi playlist một cách dễ dàng.


## 🤝 Đóng góp

Rất hoan nghênh sự đóng góp! Hãy làm theo các bước sau:

1. Fork repository.
2. Tạo một nhánh mới (`git checkout -b feature/tinh-nang-cua-ban`).
3. Thực hiện thay đổi và commit (`git commit -m "Thêm tinh năng của bạn"`).
4. Đẩy lên nhánh của bạn (`git push origin feature/tinh-nang-cua-ban`).
5. Mở một Pull Request.


## 📬 Liên hệ

Nếu có câu hỏi hoặc phản hồi, đừng ngần ngại liên hệ:

- GitHub: [gibao4222](https://github.com/gibao4222)
- Email: [voquang17@gmail.com](mailto:voquang17@gmail.com)

---

Chúc bạn nghe nhạc vui vẻ! 🎧