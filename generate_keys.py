import jwt
import time
import os

# The secret from .env
JWT_SECRET = "super_secret_jwt_key_change_in_production_32chars_min"

def generate_token(role):
    payload = {
        "iss": "supabase",
        "ref": "localhost",
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (365 * 24 * 60 * 60 * 10) # 10 years
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

anon_key = generate_token("anon")
service_role_key = generate_token("service_role")

print(f"ANON_KEY={anon_key}")
print(f"SERVICE_ROLE_KEY={service_role_key}")
