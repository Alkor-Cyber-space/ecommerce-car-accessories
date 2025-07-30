from firebase_admin import messaging
from .models import FCMToken

def send_push_notification(user, title, body, data=None):
    try:
        token_obj = FCMToken.objects.get(user=user)
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token_obj.token,
            data=data or {}
        )
        response = messaging.send(message)
        print("Successfully sent message:", response)
        return response
    except FCMToken.DoesNotExist:
        print("No FCM token for user.")
