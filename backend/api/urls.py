from django.urls import path, include
from rest_framework.routers import DefaultRouter
# 👇 IMPORTACIÓN CORREGIDA 👇
from .views import (
    PropertyViewSet, # Renombrado desde ResidentialUnitViewSet
    ResidentViewSet,
    VisitorViewSet,
    VehicleViewSet,
    FeeViewSet,
    PaymentViewSet,
    register,
    user_login
)

router = DefaultRouter()
# 👇 REGISTRO CORREGIDO 👇
router.register(r'properties', PropertyViewSet) # Renombrado desde 'residential-units'
router.register(r'residents', ResidentViewSet)
router.register(r'visitors', VisitorViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', user_login, name='user_login'),
]