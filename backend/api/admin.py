from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms import forms # Import forms to use forms.ValidationError
from .models import ResidentialUnit, Resident, Visitor, FeeType, Fee, Payment, Notice, Vehicle

# Define a custom Admin class for Resident
class ResidentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'unit', 'is_principal', 'phone_number') # Display these fields in list view
    list_filter = ('is_principal', 'unit') # Add filters
    search_fields = ('full_name', 'user__username', 'unit__name') # Add search fields
    # fields = ('user', 'unit', 'full_name', 'phone_number', 'is_principal') # Fields to show in detail view

    def save_model(self, request, obj, form, change):
        if obj.is_principal:
            # Check if another principal resident already exists for this unit
            existing_principal = Resident.objects.filter(
                unit=obj.unit, is_principal=True
            ).exclude(pk=obj.pk).first() # Exclude current object if it's an update

            if existing_principal:
                # Raise a validation error that Django admin can display
                form.add_error(
                    'is_principal', # Field to attach the error to
                    f"Ya existe un residente principal ({existing_principal.full_name}) para esta unidad."
                )
                return # Stop execution here to prevent super().save_model

        super().save_model(request, obj, form, change)

# Register Resident with the custom Admin class
admin.site.register(Resident, ResidentAdmin)

# Register other models as before
admin.site.register(ResidentialUnit)
admin.site.register(Visitor)
admin.site.register(FeeType)
admin.site.register(Fee)
admin.site.register(Payment)
admin.site.register(Notice)
admin.site.register(Vehicle)
