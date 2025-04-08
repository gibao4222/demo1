import boto3
import uuid
import os
from myproject import settings
from botocore.exceptions import NoCredentialsError
def upload_mp3_file(file, folder="audio/"):
    try:

        # Nếu file là đường dẫn (string), mở file ở chế độ đọc nhị phân
        if isinstance(file, str):
            if not file.lower().endswith(".mp3"):
                raise ValueError("File không hợp lệ. Chỉ hỗ trợ định dạng .mp3")
            with open(file, "rb") as file_obj:
                return upload_mp3_file(file_obj, folder)  # Gọi lại chính nó để xử lý tiếp

        # Kiểm tra file hợp lệ
        if not hasattr(file, "name") or not file.name.lower().endswith(".mp3"):
            raise ValueError("File không hợp lệ if. Chỉ hỗ trợ định dạng .mp3")

        # Sinh tên file ngẫu nhiên
        file_name = f"{uuid.uuid4()}.mp3"
        s3_path = f"{folder}{file_name}"

        # Kết nối S3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )

        # Upload file
        s3.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_path, ExtraArgs={"ContentType": "audio/mpeg"})

        # Trả về URL file đã upload
        file_url = f"{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_path}"
        print(file_url)

        return file_url

    except FileNotFoundError:
        print("Lỗi: Không tìm thấy file")
    except NoCredentialsError:
        print("Lỗi: Không có thông tin đăng nhập AWS")
    except Exception as e:
        print(f"Lỗi không xác định: {e}")

    finally:
        # Đóng file nếu cần
        if file and hasattr(file, "close"):
            try:
                file.close()
            except Exception as e:
                print(f"Lỗi khi đóng file: {e}")

def upload_video_file(file,folder="video/"):
    try:
        # Nếu file là đường dẫn (string), mở file ở chế độ đọc nhị phân
        if isinstance(file, str):
            if not file.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
                raise ValueError("File không hợp lệ. Chỉ hỗ trợ định dạng video .mp4, .avi, .mov, .mkv")
            with open(file, "rb") as file_obj:
                return upload_video_file(file_obj, folder)  # Gọi lại chính nó để xử lý tiếp

        # Kiểm tra file hợp lệ
        if not hasattr(file, "name") or not file.name.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
            raise ValueError("File không hợp lệ. Chỉ hỗ trợ định dạng video .mp4, .avi, .mov, .mkv")
        file_extension = os.path.splitext(file.name)[1].lower() 
        # Sinh tên file ngẫu nhiên
        file_name = f"{uuid.uuid4()}{file_extension}"
        s3_path = f"{folder}{file_name}"

        # Kết nối S3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )

        # Upload file
        s3.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_path, ExtraArgs={"ContentType": f"video/{file_extension[1:]}"})

        # Trả về URL file đã upload
        file_url = f"{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_path}"
        print(file_url)

        return file_url

    except FileNotFoundError:
        print("Lỗi: Không tìm thấy file")
    except NoCredentialsError:
        print("Lỗi: Không có thông tin đăng nhập AWS")
    except Exception as e:
        print(f"Lỗi không xác định: {e}")

    finally:
        # Đóng file nếu cần
        if file and hasattr(file, "close"):
            try:
                file.close()
            except Exception as e:
                print(f"Lỗi khi đóng file: {e}")