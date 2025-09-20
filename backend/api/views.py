from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt

# Tus Serializers
from .serializers import (
    UserRegistrationSerializer,
    PropertySerializer,
    ResidentSerializer,
    VisitorSerializer,
    VehicleSerializer,
    FeeSerializer,
    PaymentSerializer
)

# Tus Modelos
from .models import (
    Property,
    Resident,
    Visitor,
    Vehicle,
    Fee,
    Payment
)

# --- VISTAS BASADAS EN CLASES (VIEWSETS) ---

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    # permission_classes = [permissions.IsAuthenticated] # Puedes añadir permisos después

# ... (Aquí puedes añadir el resto de tus ViewSets: Visitor, Vehicle, etc.) ...
class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

# --- VISTAS BASADAS EN FUNCIONES (PARA ACCIONES ESPECÍFICAS) ---

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Vista para registrar un nuevo usuario, su perfil y su residencia.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Usuario registrado exitosamente"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 👇 A ESTA PARTE ME REFERÍA 👇
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Vista para el inicio de sesión de usuarios.
    Devuelve tokens de acceso y refresco.
    """
    # Tu frontend envía 'username', que en nuestro caso es el email.
    email = request.data.get('username')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Por favor, proporciona email y contraseña'}, status=status.HTTP_400_BAD_REQUEST)

    # Autenticamos al usuario
    user = authenticate(username=email, password=password)

    if user is not None:
        # Si la autenticación es exitosa, generamos los tokens.
        # Necesitarás configurar Simple JWT para que esto funcione.
        # Por ahora, devolvemos un mensaje de éxito.
        # from rest_framework_simplejwt.tokens import RefreshToken
        # refresh = RefreshToken.for_user(user)
        # return Response({
        #     'refresh': str(refresh),
        #     'access': str(refresh.access_token),
        # })
        return Response({'message': 'Inicio de sesión exitoso'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)