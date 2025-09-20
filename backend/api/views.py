from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken

# --- Importamos los modelos y serializadores ---
from .models import Property, Resident, Visitor, Vehicle, Fee, Payment, User
from .serializers import (
    UserRegistrationSerializer,
    PropertySerializer,
    ResidentSerializer,
    VisitorSerializer,
    VehicleSerializer,
    FeeSerializer,
    PaymentSerializer,
    UserSerializer  # Importante añadir el nuevo UserSerializer
)

# --- VISTAS BASADAS EN CLASES (VIEWSETS) ---

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    pagination_class = None

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [permissions.AllowAny]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

# ... (Aquí van el resto de tus ViewSets: Resident, Visitor, etc.) ...
class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [IsAuthenticated]

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [IsAuthenticated]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


# --- VISTAS BASADAS EN FUNCIONES ---

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({"message": f"Usuario {user.correo} registrado exitosamente"}, status=status.HTTP_201_CREATED)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    email = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)

# --- NUEVAS VISTAS PARA EL DASHBOARD ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Devuelve los datos del usuario que realiza la petición (autenticado por token).
    """
    # request.user.user es la forma de llegar a tu modelo User personalizado
    # a través de la relación OneToOne desde el AuthUser de Django.
    serializer = UserSerializer(request.user.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notices(request):
    """
    Vista temporal que devuelve una lista vacía de avisos.
    TODO: Reemplazar con la lógica real cuando tengas el modelo de Avisos.
    """
    return Response([])
