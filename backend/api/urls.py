from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet,
    ResidentViewSet,
    VisitorViewSet,
    VehicleViewSet,
    FeeViewSet,
    PaymentViewSet,
    register,
    user_login,
    get_current_user, # Importamos las nuevas vistas
    get_notices       # Importamos las nuevas vistas
)

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'residents', ResidentViewSet)
router.register(r'visitors', VisitorViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', user_login, name='user_login'),
    # --- NUEVAS RUTAS PARA EL DASHBOARD ---
    path('users/me/', get_current_user, name='current_user'),
    path('notices/', get_notices, name='get_notices'),
]
