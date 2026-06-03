from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock
from accounts.models import CustomUser, FCMToken
from accounts.send_push_notification import send_push_notification

class FirebaseAuthAndNotificationTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = CustomUser.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            phone_number="1234567890",
            password="testpassword"
        )
        self.google_login_url = reverse('google-login')
        self.save_fcm_token_url = reverse('save_fcm_token')

    @patch('accounts.views.firebase_auth.verify_id_token')
    def test_google_login_success(self, mock_verify):
        # Mock successful verification from Firebase
        mock_verify.return_value = {
            'email': 'newgoogleuser@example.com',
            'uid': 'google-uid-12345',
            'name': 'Google User',
            'picture': 'http://example.com/pic.jpg'
        }

        data = {
            'idToken': 'mocked-valid-google-token'
        }

        response = self.client.post(self.google_login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'newgoogleuser@example.com')
        self.assertEqual(response.data['user']['username'], 'Google User')

        # Verify user was created in the DB
        self.assertTrue(CustomUser.objects.filter(email='newgoogleuser@example.com').exists())

    @patch('accounts.views.firebase_auth.verify_id_token')
    def test_google_login_invalid_token(self, mock_verify):
        # Mock Firebase token verification failure
        mock_verify.side_effect = Exception("Invalid Firebase token signature")

        data = {
            'idToken': 'mocked-invalid-token'
        }

        response = self.client.post(self.google_login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid Firebase token signature')

    def test_save_fcm_token_success(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        data = {
            'token': 'fcm-device-token-abc-123'
        }

        response = self.client.post(self.save_fcm_token_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Token saved')

        # Verify FCM token was stored in DB
        self.assertTrue(FCMToken.objects.filter(user=self.user, token='fcm-device-token-abc-123').exists())

    def test_save_fcm_token_unauthenticated(self):
        data = {
            'token': 'fcm-device-token-abc-123'
        }
        response = self.client.post(self.save_fcm_token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('accounts.send_push_notification.messaging.send')
    def test_send_push_notification_success(self, mock_send):
        # Setup FCM token for user
        FCMToken.objects.create(user=self.user, token='user-fcm-token')
        
        # Mock successful messaging.send return value
        mock_send.return_value = "projects/mock-project/messages/mock-message-id"

        # Trigger send push notification
        response = send_push_notification(
            user=self.user,
            title="Hello",
            body="World",
            data={"key": "value"}
        )

        self.assertEqual(response, "projects/mock-project/messages/mock-message-id")
        mock_send.assert_called_once()
        
        # Check that the Message object passed to send had the correct properties
        called_arg = mock_send.call_args[0][0]
        self.assertEqual(called_arg.token, 'user-fcm-token')
        self.assertEqual(called_arg.notification.title, 'Hello')
        self.assertEqual(called_arg.notification.body, 'World')
        self.assertEqual(called_arg.data, {"key": "value"})

    def test_send_push_notification_no_token(self):
        # No FCMToken exists for the user
        response = send_push_notification(
            user=self.user,
            title="Hello",
            body="World"
        )
        # Should return None and not raise any exceptions
        self.assertIsNone(response)
