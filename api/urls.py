# api/urls.py
from django.urls import path
from .views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Esta linha cria o endereço: .../api/user/register/
    path("user/register/", CreateUserView.as_view(), name="register"),

    # Esta linha cria o endereço: .../api/token/
    path("token/", TokenObtainPairView.as_view(), name="get_token"),

    path("token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),
]