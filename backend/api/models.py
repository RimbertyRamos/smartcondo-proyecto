from django.db import models
from django.contrib.auth.models import User as AuthUser

# Modelo para Tipos de Usuario (Roles)
class UserType(models.Model):
    nombreTipo = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombreTipo

# Modelo para Tipos de Propiedad
class PropertyType(models.Model):
    tipoPropiedad = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.tipoPropiedad

# Modelo para Propiedades
class Property(models.Model):
    cod = models.CharField(max_length=50, unique=True)
    m2 = models.DecimalField(max_digits=10, decimal_places=2)
    nroHabitaciones = models.IntegerField()
    descripcion = models.TextField(blank=True, null=True)
    property_type = models.ForeignKey(PropertyType, on_delete=models.PROTECT)

    def __str__(self):
        return self.cod

# Modelo de Usuario principal del sistema
class User(models.Model):
    cod = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    sexo = models.CharField(max_length=10)
    telefono = models.CharField(max_length=20)
    user_type = models.ForeignKey(UserType, on_delete=models.PROTECT)
    auth_user = models.OneToOneField(AuthUser, on_delete=models.CASCADE, null=True, blank=True, db_column='auth_user_id')

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Resident(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    unit = models.ForeignKey(Property, related_name='residents', on_delete=models.CASCADE)
    is_principal = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.nombre} ({self.unit.cod})"

class Visitor(models.Model):
    full_name = models.CharField(max_length=255)
    entry_datetime = models.DateTimeField(auto_now_add=True)
    exit_datetime = models.DateTimeField(null=True, blank=True)
    authorized_by = models.ForeignKey(Resident, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.full_name

class Vehicle(models.Model):
    plate_number = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True, null=True)
    owner = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='vehicles')

    def __str__(self):
        return self.plate_number

# --- Finanzas ---
class FeeStatus(models.Model):
    nombreEstado = models.CharField(max_length=50)

    def __str__(self):
        return self.nombreEstado

class Fee(models.Model):
    fechaEmision = models.DateField()
    montoTotal = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.ForeignKey(FeeStatus, on_delete=models.PROTECT)

    def __str__(self):
        return f"Factura #{self.id} - {self.status.nombreEstado}"

class FeeItem(models.Model):
    fee = models.ForeignKey(Fee, related_name='items', on_delete=models.CASCADE)
    descripcion = models.CharField(max_length=255)
    monto = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.descripcion

class PaymentType(models.Model):
    tipoPago = models.CharField(max_length=100)

    def __str__(self):
        return self.tipoPago

class Payment(models.Model):
    montoPagado = models.DecimalField(max_digits=10, decimal_places=2)
    fechaPago = models.DateField()
    payment_type = models.ForeignKey(PaymentType, on_delete=models.PROTECT)

    def __str__(self):
        return f"Pago de {self.montoPagado} el {self.fechaPago}"

class FeePayment(models.Model):
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    montoAplicado = models.DecimalField(max_digits=10, decimal_places=2)

# --- Comunicados y Reservas ---
class CommunicationType(models.Model):
    tipoComunicado = models.CharField(max_length=100)

    def __str__(self):
        return self.tipoComunicado

class Communication(models.Model):
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    fechaInicio = models.DateField()
    fechaFin = models.DateField()
    communication_type = models.ForeignKey(CommunicationType, on_delete=models.PROTECT)

    def __str__(self):
        return self.titulo