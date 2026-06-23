"""
TaskFlow – Behavior Driven Task Management System
auth.py

Custom JWT serializer that accepts EITHER email OR username alongside a
password, so the frontend login form only needs one credential field.

The token payload is extended with extra claims (username, email, role)
so the frontend can bootstrap the session without a separate /auth/me/ call.
"""

from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# ---------------------------------------------------------------------------
# Token serializer – email OR username login
# ---------------------------------------------------------------------------

class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT's default TokenObtainPairSerializer to:

    1. Accept ``email`` or ``username`` in the ``login`` field.
    2. Inject ``username``, ``email``, and ``role`` as extra JWT claims
       so the client can read user context directly from the decoded token.

    Request body:
        { "login": "alice@example.com", "password": "s3cr3t" }
      or
        { "login": "alice", "password": "s3cr3t" }
    """

    # Replace the default 'username' field with a generic 'login' field
    username_field = "login"

    login = serializers.CharField(
        write_only=True,
        help_text="Your email address or username.",
    )
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs: dict) -> dict:
        login    = attrs.get("login", "").strip()
        password = attrs.get("password", "")

        # Resolve the user by email (case-insensitive) or by exact username
        user = self._resolve_user(login)

        if user is None:
            raise serializers.ValidationError(
                {"login": _("No active account found with the given credentials.")},
                code="no_active_account",
            )

        # Verify the password using Django's authentication backend
        authenticated = authenticate(
            request=self.context.get("request"),
            username=user.username,   # authenticate() always works on username
            password=password,
        )

        if authenticated is None:
            raise serializers.ValidationError(
                {"password": _("Incorrect password.")},
                code="authentication_failed",
            )

        if not authenticated.is_active:
            raise serializers.ValidationError(
                _("This account has been deactivated."),
                code="account_disabled",
            )

        # Build the token pair
        refresh = self.get_token(authenticated)

        return {
            "access":  str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id":       authenticated.id,
                "username": authenticated.username,
                "email":    authenticated.email,
                "role":     authenticated.role,
            },
        }

    # ------------------------------------------------------------------
    # Extra claims added to every token payload
    # ------------------------------------------------------------------

    @classmethod
    def get_token(cls, user: User) -> RefreshToken:
        token = super().get_token(user)
        token["username"] = user.username
        token["email"]    = user.email
        token["role"]     = user.role
        return token

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_user(login: str):
        """
        Try to find a user by email first, then by username.
        Returns the User instance or None.
        """
        try:
            return User.objects.get(email__iexact=login)
        except User.DoesNotExist:
            pass
        try:
            return User.objects.get(username=login)
        except User.DoesNotExist:
            return None


# ---------------------------------------------------------------------------
# Token refresh serializer (thin wrapper — just for a clean import path)
# ---------------------------------------------------------------------------

from rest_framework_simplejwt.serializers import TokenRefreshSerializer  # noqa: E402, F401
