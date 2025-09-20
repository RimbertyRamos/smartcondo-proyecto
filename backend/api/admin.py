from django.contrib import admin
# Importa todos los nuevos modelos que creamos
from .models import (
    UserType,
    PropertyType,
    Property,
    User,
    Resident,
    Visitor,
    Vehicle,
    FeeStatus,
    Fee,
    FeeItem,
    PaymentType,
    Payment,
    FeePayment,
    CommunicationType,
    Communication,
)

# Registra cada modelo para que aparezca en el admin
admin.site.register(UserType)
admin.site.register(PropertyType)
admin.site.register(Property)
admin.site.register(User)
admin.site.register(Resident)
admin.site.register(Visitor)
admin.site.register(Vehicle)
admin.site.register(FeeStatus)
admin.site.register(Fee)
admin.site.register(FeeItem)
admin.site.register(PaymentType)
admin.site.register(Payment)
admin.site.register(FeePayment)
admin.site.register(CommunicationType)
admin.site.register(Communication)