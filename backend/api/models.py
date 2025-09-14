from django.db import models
from django.contrib.auth.models import User

class ResidentialUnit(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="E.g., 'Apartment 101', 'House 12B'")
    address = models.CharField(max_length=255, blank=True)
    owner = models.ForeignKey(User, related_name='owned_units', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Resident(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    unit = models.ForeignKey(ResidentialUnit, related_name='residents', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    is_principal = models.BooleanField(default=False, help_text="Is this the principal resident (owner or main tenant) of the unit?")

    def __str__(self):
        return f"{self.full_name} ({self.unit.name})"

class Visitor(models.Model):
    full_name = models.CharField(max_length=255)
    id_document = models.CharField(max_length=50, blank=True, help_text="e.g., DNI, Passport Number")
    entry_datetime = models.DateTimeField(auto_now_add=True)
    exit_datetime = models.DateTimeField(null=True, blank=True)
    authorized_by = models.ForeignKey(Resident, on_delete=models.SET_NULL, null=True, blank=True)
    photo = models.ImageField(upload_to='visitors/%Y/%m/%d/', null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} (Entered: {self.entry_datetime.strftime('%Y-%m-%d %H:%M')})"

class FeeType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    default_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.name

class Fee(models.Model):
    fee_type = models.ForeignKey(FeeType, on_delete=models.PROTECT)
    unit = models.ForeignKey(ResidentialUnit, on_delete=models.CASCADE, related_name='fees')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    issue_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']
        verbose_name = "Fee"
        verbose_name_plural = "Fees"

    def __str__(self):
        return f"{self.fee_type.name} for {self.unit.name} - Due: {self.due_date}"

class Payment(models.Model):
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment of {self.amount_paid} for {self.fee.fee_type.name} on {self.payment_date.strftime('%Y-%m-%d')}"

class Notice(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    published_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-published_date']
        verbose_name = "Notice"
        verbose_name_plural = "Notices"

    def __str__(self):
        return self.title

class Vehicle(models.Model):
    plate_number = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True, null=True)
    owner = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='vehicles')

    def __str__(self):
        return f"{self.plate_number} ({self.brand} {self.model})"