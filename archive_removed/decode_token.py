import jwt
import json

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3MDYyNzcxNiwianRpIjoiNTY5MjEwNGEtNDg2Ny00MjMzLWJkNWItODQ3ZjliNTgxMjZjIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJlbWFpbCI6ImFkbWluQGdyZWVuY2FtcHVzLmNvbSIsInJvbGUiOiJhZG1pbiJ9LCJuYmYiOjE3NzA2Mjc3MTYsImV4cCI6MTc3MDYyODYxNn0.Ewhf1ww_0TA8ypcsxZB7IfM0l7N9XXnWBkGcXHzxLMU"

# Decode without verification to see contents
decoded = jwt.decode(token, options={"verify_signature": False})
print(json.dumps(decoded, indent=2))
print(f"\nIdentity (sub): {decoded.get('sub')}")
