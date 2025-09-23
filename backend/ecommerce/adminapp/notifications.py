from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

def create_notification(user: User, message: str) -> Notification:
    """
    Helper function to create a notification for a user.
    """
    if not user or not isinstance(user, User):
        raise ValueError("Invalid user provided for notification.")

    notification = Notification.objects.create(
        user=user,
        message=message
    )
    return notification