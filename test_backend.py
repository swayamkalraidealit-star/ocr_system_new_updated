import requests
import time
import os

BASE_URL = "http://localhost:8000"

def test_backend():
    print("Waiting for server to start...")
    time.sleep(2)
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Root: {r.status_code} {r.json()}")
        assert r.status_code == 200
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    # 2. Register
    email = f"test_{int(time.time())}@example.com"
    password = "securepassword123"
    username = "testuser"
    
    print(f"Registering user: {email}...")
    r = requests.post(f"{BASE_URL}/users/register", json={
        "username": username,
        "email": email,
        "password": password
    })
    print(f"Register Response: {r.status_code} {r.text}")
    assert r.status_code == 200
    user_id = r.json()["id"]

    # 3. Login
    print("Logging in...")
    r = requests.post(f"{BASE_URL}/users/token", data={
        "username": email,
        "password": password
    })
    print(f"Login Response: {r.status_code}")
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Get Data
    print("Fetching User Data...")
    r = requests.get(f"{BASE_URL}/users/me", headers=headers)
    print(f"Me Response: {r.status_code} {r.json()}")
    assert r.status_code == 200
    assert r.json()["email"] == email

    # 5. Test Analysis Endpoint (Authentication Check)
    # We won't send a real file yet, just check that it requires auth or fails correctly
    print("Testing Analysis (No File)...")
    r = requests.post(f"{BASE_URL}/analysis/analyze", headers=headers)
    print(f"Analysis Response (Expected 422): {r.status_code}")
    assert r.status_code == 422 # Missing file

    # 6. Delete User
    print("Deleting User...")
    r = requests.delete(f"{BASE_URL}/users/me", headers=headers)
    print(f"Delete Response: {r.status_code} {r.json()}")
    assert r.status_code == 200

    print("✅ All Tests Passed!")

if __name__ == "__main__":
    test_backend()
