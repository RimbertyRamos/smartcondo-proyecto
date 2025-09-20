from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser, Group
from django.contrib.auth.password_validation import validate_password
from .models import User, Property, Resident, UserType, PropertyType, Visitor, Vehicle, Fee, Payment


# --- SERIALIZADOR DE USUARIO (PARA MOSTRAR DATOS) ---
class UserSerializer(serializers.ModelSerializer):
    # Obtenemos los roles (grupos) del usuario de autenticación
    groups = serializers.SerializerMethodField()
    # Usamos el username del AuthUser que es el correo
    username = serializers.CharField(source='auth_user.username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'cod', 'nombre', 'apellido', 'correo', 'sexo', 'telefono', 'groups', 'username']

    def get_groups(self, obj):
        # obj es la instancia de tu modelo User
        # obj.auth_user es la instancia del AuthUser de Django
        return [group.name for group in obj.auth_user.groups.all()]


# --- SERIALIZADOR DE REGISTRO ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    property = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), write_only=True
    )

    class Meta:
        model = User
        fields = ('cod', 'nombre', 'apellido', 'correo', 'sexo', 'telefono', 'password', 'property')

    def create(self, validated_data):
        propiedad = validated_data.pop('property')
        password = validated_data.pop('password')

        # Asignamos el correo también al username para la autenticación
        auth_user = AuthUser.objects.create_user(
            username=validated_data['correo'],
            password=password,
            email=validated_data['correo']
        )

        # Asignar al grupo "Residente" por defecto
        try:
            residente_group = Group.objects.get(name='Residente')
            auth_user.groups.add(residente_group)
        except Group.DoesNotExist:
            # Opcional: Crear el grupo si no existe
            pass

        try:
            user_type = UserType.objects.get(nombreTipo='Residente')
        except UserType.DoesNotExist:
            raise serializers.ValidationError("El tipo de usuario 'Residente' no existe.")

        user = User.objects.create(
            user_type=user_type,
            auth_user=auth_user,
            **validated_data
        )

        Resident.objects.create(
            user=user,
            unit=propiedad,
            is_principal=True
        )
        return user


# --- OTROS SERIALIZADORES ---
class PropertySerializer(serializers.ModelSerializer):
    property_type_name = serializers.CharField(source='property_type.tipoPropiedad', read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'cod', 'm2', 'nroHabitaciones', 'descripcion', 'property_type', 'property_type_name']


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
