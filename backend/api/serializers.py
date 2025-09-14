from rest_framework import serializers
from .models import ResidentialUnit, Resident, Visitor, FeeType, Fee, Payment, Notice, Vehicle
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError # Alias to avoid conflict

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    is_principal = serializers.SerializerMethodField()
    resident_id = serializers.SerializerMethodField() # New field
    unit_name = serializers.SerializerMethodField() # New field

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups', 'is_principal', 'resident_id', 'unit_name'] # Added unit_name

    def get_is_principal(self, obj):
        try:
            return obj.resident.is_principal
        except Resident.DoesNotExist:
            return None

    def get_resident_id(self, obj):
        try:
            return obj.resident.id
        except Resident.DoesNotExist:
            return None

    def get_unit_name(self, obj):
        try:
            return obj.resident.unit.name
        except Resident.DoesNotExist:
            return None


class ResidentialUnitSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True) # Nested serializer for owner
    owner_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='owner', write_only=True, required=False)

    class Meta:
        model = ResidentialUnit
        fields = '__all__'

class ResidentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True)
    unit = ResidentialUnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(queryset=ResidentialUnit.objects.all(), source='unit', write_only=True)

    class Meta:
        model = Resident
        fields = '__all__'
        # Removed 'is_principal' from read_only_fields to allow admin to change it

    def validate(self, data):
        # Check for uniqueness of is_principal per unit
        # Get the value of is_principal from validated_data or instance if not provided in data
        is_principal_value = data.get('is_principal', getattr(self.instance, 'is_principal', False))

        if is_principal_value is True:
            unit = data.get('unit', getattr(self.instance, 'unit', None))
            if unit:
                # If updating an existing resident, exclude self from the query
                if self.instance: # This is an update operation
                    existing_principal = Resident.objects.filter(
                        unit=unit, is_principal=True
                    ).exclude(pk=self.instance.pk).first()
                else: # This is a create operation
                    existing_principal = Resident.objects.filter(
                        unit=unit, is_principal=True
                    ).first()

                if existing_principal:
                    raise serializers.ValidationError(
                        {'is_principal': 'Ya existe un residente principal para esta unidad.'}
                    )
        return data


class VisitorSerializer(serializers.ModelSerializer):
    authorized_by = ResidentSerializer(read_only=True)
    authorized_by_id = serializers.PrimaryKeyRelatedField(queryset=Resident.objects.all(), source='authorized_by', write_only=True, required=False)

    class Meta:
        model = Visitor
        fields = '__all__'

class FeeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeType
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    fee_type = FeeTypeSerializer(read_only=True)
    fee_type_id = serializers.PrimaryKeyRelatedField(queryset=FeeType.objects.all(), source='fee_type', write_only=True)
    unit = ResidentialUnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(queryset=ResidentialUnit.objects.all(), source='unit', write_only=True)

    class Meta:
        model = Fee
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    fee = FeeSerializer(read_only=True)
    fee_id = serializers.PrimaryKeyRelatedField(queryset=Fee.objects.all(), source='fee', write_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='author', write_only=True, required=False)

    class Meta:
        model = Notice
        fields = '__all__'

class VehicleSerializer(serializers.ModelSerializer):
    owner = ResidentSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(queryset=Resident.objects.all(), source='owner', write_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'

# Add this new serializer at the end of the file
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    unit_id = serializers.PrimaryKeyRelatedField(queryset=ResidentialUnit.objects.all())

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        # Check if this is the first resident for the unit
        is_principal_resident = not Resident.objects.filter(unit=validated_data['unit_id']).exists()

        resident = Resident.objects.create(
            user=user,
            unit=validated_data['unit_id'],
            full_name=validated_data['full_name'],
            phone_number=validated_data.get('phone_number', ''),
            is_principal=is_principal_resident # Set is_principal based on check
        )
        # Assign user to 'Residente' group
        try:
            residente_group = Group.objects.get(name='Residente')
            user.groups.add(residente_group)
        except Group.DoesNotExist:
            # Handle case where 'Residente' group doesn't exist (e.g., log a warning)
            print("Warning: 'Residente' group does not exist. User not assigned to group.")
        return {'user': user, 'resident': resident}

    def validate(self, data):
        # Validate password using Django's built-in validators
        try:
            validate_password(data['password'], user=User(username=data['username']))
        except DjangoValidationError as e:
            # Map common English messages to Spanish
            spanish_messages = []
            for msg in e.messages:
                if "This password is too short." in msg:
                    spanish_messages.append("La contraseña es demasiado corta. Debe contener al menos 8 caracteres.")
                elif "This password is too common." in msg:
                    spanish_messages.append("Esta contraseña es demasiado común.")
                elif "This password is entirely numeric." in msg:
                    spanish_messages.append("Esta contraseña es completamente numérica.")
                elif "The password is too similar to the username." in msg:
                    spanish_messages.append("La contraseña es demasiado similar al nombre de usuario.")
                else:
                    spanish_messages.append(msg) # Fallback for unhandled messages
            raise serializers.ValidationError({'password': spanish_messages})
        return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
