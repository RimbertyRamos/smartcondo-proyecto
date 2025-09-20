from rest_framework import serializers
# 👇 IMPORTACIÓN CORREGIDA 👇
from .models import (
    Property,
    Resident,
    Visitor,
    Vehicle,
    Fee,
    Payment,
    User,  # Añadimos el User para el serializer de registro/login
    # Puedes añadir el resto de tus modelos aquí si vas a crear serializers para ellos
)
from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from django.contrib.auth.password_validation import validate_password

from .models import User, Resident, Property, UserType

# --- Serializers ---

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ['id', 'username', 'email']


# 👇 SERIALIZER CORREGIDO: Usa 'Property' en lugar de 'ResidentialUnit' 👇
class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'  # Incluye todos los campos del modelo Property


class ResidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resident
        fields = '__all__'


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = '__all__'


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'


class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class UserRegistrationSerializer(serializers.ModelSerializer):
    # Campos que esperamos recibir del frontend
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    property_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = User
        # Los campos de nuestro modelo User que se llenarán
        fields = ('cod', 'nombre', 'apellido', 'correo', 'sexo', 'telefono', 'password', 'property_id')

    def create(self, validated_data):
        # 1. Crear el usuario de autenticación de Django (para login)
        auth_user = AuthUser.objects.create_user(
            username=validated_data['correo'],  # Usaremos el correo como username
            password=validated_data['password'],
            email=validated_data['correo']
        )

        # 2. Obtener el tipo de usuario "Residente" (debes crearlo en el admin)
        try:
            user_type = UserType.objects.get(nombreTipo='Residente')
        except UserType.DoesNotExist:
            raise serializers.ValidationError(
                "El tipo de usuario 'Residente' no existe. Por favor, créalo en el panel de administrador.")

        # 3. Crear nuestro usuario personalizado
        user = User.objects.create(
            cod=validated_data['cod'],
            nombre=validated_data['nombre'],
            apellido=validated_data['apellido'],
            correo=validated_data['correo'],
            sexo=validated_data['sexo'],
            telefono=validated_data['telefono'],
            user_type=user_type,
            auth_user=auth_user
        )

        # 4. Crear el Residente y asociarlo a la propiedad
        try:
            propiedad = Property.objects.get(id=validated_data['property_id'])
        except Property.DoesNotExist:
            raise serializers.ValidationError("La propiedad seleccionada no existe.")

        Resident.objects.create(
            user=user,
            unit=propiedad,
            is_principal=True  # Asumimos que el primer registro es el principal
        )

        return user
