import os
import tempfile
import unittest
from app import app, db, Organization, SystemConfig

class AppTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

        with app.app_context():
            # Ensure tables exist and default data is present (handled by app.py)
            pass

    def tearDown(self):
        pass

    def test_get_config(self):
        response = self.client.get('/api/config')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['scan_threshold'], 35)

    def test_update_config(self):
        response = self.client.post('/api/config', json={
            "scan_threshold": 40,
            "imgbb_key": "test_imgbb_key"
        })
        self.assertEqual(response.status_code, 200)
        
        # Verify update
        response = self.client.get('/api/config')
        data = response.get_json()
        self.assertEqual(data['scan_threshold'], 40)
        self.assertEqual(data['imgbb_key'], "test_imgbb_key")

    def test_get_stats(self):
        response = self.client.get('/api/stats')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total_assets'], 0)
        self.assertEqual(data['total_violations'], 0)

if __name__ == '__main__':
    unittest.main()
