# audit/mixins.py
from .utils import log_action

class AuditLogMixin:
    """
    Mixin to automatically log create/update/delete actions.
    """
    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(
            self.request.user,
            'create',
            f"Created {self.__class__.__name__} object: {instance}"
        )
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(
            self.request.user,
            'update',
            f"Updated {self.__class__.__name__} object: {instance}"
        )
        return instance

    def perform_destroy(self, instance):
        log_action(
            self.request.user,
            'delete',
            f"Deleted {self.__class__.__name__} object: {instance}"
        )
        super().perform_destroy(instance)
