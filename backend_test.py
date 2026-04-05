#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for PMTF Vehicle Fleet Management System
Tests all endpoints, authentication, authorization, and CRUD operations
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class PMTFAPITester:
    def __init__(self, base_url: str = "https://frota-veiculos.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.admin_cookies = None
        self.user_cookies = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials from /app/memory/test_credentials.md
        self.admin_creds = {
            "email": "admin@pmtf.gov.br",
            "password": "admin123"
        }
        self.user_creds = {
            "email": "usuario@pmtf.gov.br", 
            "password": "usuario123"
        }

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    cookies: Optional[Dict] = None, headers: Optional[Dict] = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}/api{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method == 'GET':
                return requests.get(url, headers=default_headers, cookies=cookies, timeout=30)
            elif method == 'POST':
                return requests.post(url, json=data, headers=default_headers, cookies=cookies, timeout=30)
            elif method == 'PUT':
                return requests.put(url, json=data, headers=default_headers, cookies=cookies, timeout=30)
            elif method == 'DELETE':
                return requests.delete(url, headers=default_headers, cookies=cookies, timeout=30)
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_admin_login(self) -> bool:
        """Test admin login and store cookies"""
        print("\n🔐 Testing Admin Authentication...")
        
        response = self.make_request('POST', '/auth/login', self.admin_creds)
        if not response:
            self.log_test("Admin Login - Request Failed", False, "Network error")
            return False
            
        success = response.status_code == 200
        if success:
            self.admin_cookies = response.cookies
            try:
                user_data = response.json()
                if user_data.get('role') == 'ADMIN':
                    self.log_test("Admin Login", True, f"Logged in as {user_data.get('name')}")
                else:
                    self.log_test("Admin Login", False, f"Wrong role: {user_data.get('role')}")
                    return False
            except:
                self.log_test("Admin Login", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
            
        return success

    def test_user_login(self) -> bool:
        """Test standard user login and store cookies"""
        print("\n👤 Testing Standard User Authentication...")
        
        response = self.make_request('POST', '/auth/login', self.user_creds)
        if not response:
            self.log_test("User Login - Request Failed", False, "Network error")
            return False
            
        success = response.status_code == 200
        if success:
            self.user_cookies = response.cookies
            try:
                user_data = response.json()
                if user_data.get('role') == 'PADRÃO':
                    self.log_test("Standard User Login", True, f"Logged in as {user_data.get('name')}")
                else:
                    self.log_test("Standard User Login", False, f"Wrong role: {user_data.get('role')}")
                    return False
            except:
                self.log_test("Standard User Login", False, "Invalid JSON response")
                return False
        else:
            self.log_test("Standard User Login", False, f"Status: {response.status_code}")
            
        return success

    def test_auth_me(self):
        """Test /auth/me endpoint for both users"""
        print("\n🔍 Testing Auth Me Endpoint...")
        
        # Test admin
        response = self.make_request('GET', '/auth/me', cookies=self.admin_cookies)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Auth Me - Admin", True, f"Role: {data.get('role')}")
        else:
            self.log_test("Auth Me - Admin", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test standard user
        response = self.make_request('GET', '/auth/me', cookies=self.user_cookies)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Auth Me - User", True, f"Role: {data.get('role')}")
        else:
            self.log_test("Auth Me - User", False, f"Status: {response.status_code if response else 'No response'}")

    def test_vehicle_endpoints(self):
        """Test all vehicle-related endpoints"""
        print("\n🚗 Testing Vehicle Endpoints...")
        
        # Test get all vehicles (both users should have access)
        response = self.make_request('GET', '/vehicles', cookies=self.admin_cookies)
        if response and response.status_code == 200:
            vehicles = response.json()
            self.log_test("Get All Vehicles - Admin", True, f"Found {len(vehicles)} vehicles")
        else:
            self.log_test("Get All Vehicles - Admin", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test with standard user
        response = self.make_request('GET', '/vehicles', cookies=self.user_cookies)
        if response and response.status_code == 200:
            self.log_test("Get All Vehicles - User", True)
        else:
            self.log_test("Get All Vehicles - User", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test category endpoints
        categories = [
            ('/vehicles/em-atividade', 'Active Vehicles'),
            ('/vehicles/em-manutencao', 'Maintenance Vehicles'),
            ('/vehicles/inativos', 'Inactive Vehicles')
        ]
        
        for endpoint, name in categories:
            response = self.make_request('GET', endpoint, cookies=self.admin_cookies)
            if response and response.status_code == 200:
                vehicles = response.json()
                self.log_test(f"Get {name}", True, f"Found {len(vehicles)} vehicles")
            else:
                self.log_test(f"Get {name}", False, f"Status: {response.status_code if response else 'No response'}")

    def test_vehicle_crud_admin_only(self):
        """Test vehicle CRUD operations (admin only)"""
        print("\n🔧 Testing Vehicle CRUD Operations (Admin Only)...")
        
        # Test create vehicle (admin only)
        test_vehicle = {
            "placa": "TEST-1234",
            "marca": "Test Brand",
            "modelo": "Test Model",
            "ano_fabricacao": 2023,
            "chassi": "TEST123456789",
            "status": "EM_ATIVIDADE",
            "lotacao_atual": "Test Department"
        }
        
        response = self.make_request('POST', '/vehicles', test_vehicle, cookies=self.admin_cookies)
        created_vehicle_id = None
        if response and response.status_code == 200:
            vehicle_data = response.json()
            created_vehicle_id = vehicle_data.get('id')
            self.log_test("Create Vehicle - Admin", True, f"Created vehicle with ID: {created_vehicle_id}")
        else:
            self.log_test("Create Vehicle - Admin", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test create vehicle with standard user (should fail)
        response = self.make_request('POST', '/vehicles', test_vehicle, cookies=self.user_cookies)
        if response and response.status_code == 403:
            self.log_test("Create Vehicle - User (Should Fail)", True, "Correctly denied access")
        else:
            self.log_test("Create Vehicle - User (Should Fail)", False, f"Expected 403, got {response.status_code if response else 'No response'}")
        
        # Test update vehicle (admin only)
        if created_vehicle_id:
            update_data = {"lotacao_atual": "Updated Department"}
            response = self.make_request('PUT', f'/vehicles/{created_vehicle_id}', update_data, cookies=self.admin_cookies)
            if response and response.status_code == 200:
                self.log_test("Update Vehicle - Admin", True)
            else:
                self.log_test("Update Vehicle - Admin", False, f"Status: {response.status_code if response else 'No response'}")
            
            # Test vehicle history
            response = self.make_request('GET', f'/vehicles/{created_vehicle_id}/historico', cookies=self.admin_cookies)
            if response and response.status_code == 200:
                history = response.json()
                self.log_test("Get Vehicle History", True, f"Found {len(history)} history entries")
            else:
                self.log_test("Get Vehicle History", False, f"Status: {response.status_code if response else 'No response'}")
            
            # Test delete vehicle (admin only)
            response = self.make_request('DELETE', f'/vehicles/{created_vehicle_id}', cookies=self.admin_cookies)
            if response and response.status_code == 200:
                self.log_test("Delete Vehicle - Admin", True)
            else:
                self.log_test("Delete Vehicle - Admin", False, f"Status: {response.status_code if response else 'No response'}")

    def test_user_management_admin_only(self):
        """Test user management endpoints (admin only)"""
        print("\n👥 Testing User Management (Admin Only)...")
        
        # Test get users (admin only)
        response = self.make_request('GET', '/users', cookies=self.admin_cookies)
        if response and response.status_code == 200:
            users = response.json()
            self.log_test("Get Users - Admin", True, f"Found {len(users)} users")
        else:
            self.log_test("Get Users - Admin", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test get users with standard user (should fail)
        response = self.make_request('GET', '/users', cookies=self.user_cookies)
        if response and response.status_code == 403:
            self.log_test("Get Users - User (Should Fail)", True, "Correctly denied access")
        else:
            self.log_test("Get Users - User (Should Fail)", False, f"Expected 403, got {response.status_code if response else 'No response'}")
        
        # Test create user (admin only)
        test_user = {
            "email": f"test.user.{datetime.now().strftime('%H%M%S')}@pmtf.gov.br",
            "password": "testpass123",
            "name": "Test User",
            "role": "PADRÃO"
        }
        
        response = self.make_request('POST', '/users', test_user, cookies=self.admin_cookies)
        created_user_id = None
        if response and response.status_code == 200:
            user_data = response.json()
            created_user_id = user_data.get('id')
            self.log_test("Create User - Admin", True, f"Created user with ID: {created_user_id}")
        else:
            self.log_test("Create User - Admin", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test delete user (admin only)
        if created_user_id:
            response = self.make_request('DELETE', f'/users/{created_user_id}', cookies=self.admin_cookies)
            if response and response.status_code == 200:
                self.log_test("Delete User - Admin", True)
            else:
                self.log_test("Delete User - Admin", False, f"Status: {response.status_code if response else 'No response'}")

    def test_logout(self):
        """Test logout functionality"""
        print("\n🚪 Testing Logout...")
        
        response = self.make_request('POST', '/auth/logout', cookies=self.admin_cookies)
        if response and response.status_code == 200:
            self.log_test("Logout - Admin", True)
        else:
            self.log_test("Logout - Admin", False, f"Status: {response.status_code if response else 'No response'}")

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        print("\n🚫 Testing Invalid Credentials...")
        
        invalid_creds = {"email": "invalid@pmtf.gov.br", "password": "wrongpass"}
        response = self.make_request('POST', '/auth/login', invalid_creds)
        if response and response.status_code == 401:
            self.log_test("Invalid Login Attempt", True, "Correctly rejected invalid credentials")
        else:
            self.log_test("Invalid Login Attempt", False, f"Expected 401, got {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting PMTF Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test invalid credentials first
        self.test_invalid_credentials()
        
        # Test authentication
        admin_login_success = self.test_admin_login()
        user_login_success = self.test_user_login()
        
        if not admin_login_success or not user_login_success:
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Test auth endpoints
        self.test_auth_me()
        
        # Test vehicle endpoints
        self.test_vehicle_endpoints()
        self.test_vehicle_crud_admin_only()
        
        # Test user management
        self.test_user_management_admin_only()
        
        # Test logout
        self.test_logout()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

def main():
    """Main test execution"""
    tester = PMTFAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())