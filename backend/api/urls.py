from django.urls import path # Import path
from rest_framework.routers import DefaultRouter
from .views import (
    ResidentialUnitViewSet, ResidentViewSet, VisitorViewSet,
    FeeTypeViewSet, FeeViewSet, PaymentViewSet, NoticeViewSet,
    UserViewSet, VehicleViewSet, GroupViewSet, # Added GroupViewSet
    UserRegistrationView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'residential-units', ResidentialUnitViewSet)
router.register(r'residents', ResidentViewSet)
router.register(r'visitors', VisitorViewSet)
router.register(r'fee-types', FeeTypeViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'groups', GroupViewSet) # Registered GroupViewSet

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'), # New registration URL
] + router.urls # Combine with router URLs
