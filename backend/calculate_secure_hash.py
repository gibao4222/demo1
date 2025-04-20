import hmac
import hashlib
import urllib.parse

vnp_params = {
    "vnp_Amount": "10000000",  # 100,000 VND * 100
    "vnp_BankCode": "NCB",
    "vnp_ResponseCode": "00",
    "vnp_TxnRef": "ORDER_20250416104312",  # Thay bằng order_id của bạn
}
sorted_params = sorted(vnp_params.items())
query_string = urllib.parse.urlencode(sorted_params)
hash_data = query_string.encode("utf-8")
secret_key = "NS1S7SYJ5HJQ0J3B1Z1HQKHUCXP46SCS"
secure_hash = hmac.new(
    secret_key.encode("utf-8"),
    hash_data,
    hashlib.sha512,
).hexdigest()
print(secure_hash)