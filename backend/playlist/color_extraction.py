# playlist/color_extraction.py
import requests
from colorthief import ColorThief
from django.http import JsonResponse
from io import BytesIO
import logging
from PIL import Image

logger = logging.getLogger(__name__)

def get_dominant_color(request):
    image_url = request.GET.get('image_url')

    if not image_url:
        logger.error("Image URL is missing in the request")
        return JsonResponse({'error': 'Image URL is required'}, status=400)

    try:
        logger.info(f"Fetching image from URL: {image_url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.pinterest.com/',  # Giả lập referer
            'Accept': 'image/jpeg,image/png,*/*',
        }
        response = requests.get(image_url, timeout=10, verify=False, headers=headers)
        response.raise_for_status()
        logger.info("Image fetched successfully")

        # Kiểm tra định dạng ảnh
        image_data = BytesIO(response.content)
        try:
            img = Image.open(image_data)
            img.verify()  # Kiểm tra xem ảnh có hợp lệ không
            image_data.seek(0)  # Reset con trỏ sau khi verify
            logger.info(f"Image format: {img.format}")
        except Exception as e:
            logger.error(f"Invalid image format: {str(e)}")
            return JsonResponse({'error': 'Invalid image format'}, status=400)

        # Phân tích màu sắc
        color_thief = ColorThief(image_data)
        logger.info("ColorThief initialized")

        dominant_color = color_thief.get_color(quality=1)
        logger.info(f"Dominant color extracted: {dominant_color}")

        hex_color = '#{:02x}{:02x}{:02x}'.format(dominant_color[0], dominant_color[1], dominant_color[2])
        logger.info(f"Hex color: {hex_color}")

        return JsonResponse({'dominant_color': hex_color})
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch image: {str(e)}")
        return JsonResponse({'error': f'Failed to fetch image: {str(e)}'}, status=400)
    except Exception as e:
        logger.error(f"Failed to extract dominant color: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'Internal server error'}, status=500)