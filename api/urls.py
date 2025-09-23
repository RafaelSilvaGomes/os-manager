# api/urls.py
from django.urls import path, include
from .views import CreateUserView, ClienteViewSet, ServicoViewSet, OrdemDeServicoViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'ordens', OrdemDeServicoViewSet, basename='ordemdeservico')

urlpatterns = [
    path("user/register/", CreateUserView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),
    path('', include(router.urls)),  
]