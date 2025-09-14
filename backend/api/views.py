from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action # Added action
from rest_framework.response import Response # Added Response
from rest_framework.views import APIView # Added APIView
from rest_framework.throttling import AnonRateThrottle # Added AnonRateThrottle
import rest_framework.serializers as serializers # Added this import

from .models import ResidentialUnit, Resident, Visitor, FeeType, Fee, Payment, Notice, Vehicle
from .serializers import (
    ResidentialUnitSerializer, ResidentSerializer, VisitorSerializer,
    FeeTypeSerializer, FeeSerializer, PaymentSerializer, NoticeSerializer, VehicleSerializer,
    UserRegistrationSerializer, GroupSerializer # Import the new serializer
)
from django.contrib.auth.models import User, Group
from .serializers import UserSerializer # Import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        data = serializer.data
        data['groups'] = [group.name for group in request.user.groups.all()]
        return Response(data)

    def perform_update(self, serializer):
        # Save the user instance
        user = serializer.save()

        # Handle group updates if 'groups' data is provided in the request
        group_names = self.request.data.get('groups', None)
        if group_names is not None:
            if not isinstance(group_names, list):
                raise serializers.ValidationError({"groups": "Expected a list of group names."})

            # Clear existing groups and add new ones
            user.groups.clear()
            for group_name in group_names:
                try:
                    group = Group.objects.get(name=group_name)
                    user.groups.add(group)
                except Group.DoesNotExist:
                    raise serializers.ValidationError({"groups": f"Group '{group_name}' does not exist."})

class ResidentialUnitViewSet(viewsets.ModelViewSet):
    queryset = ResidentialUnit.objects.all()
    serializer_class = ResidentialUnitSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'retrieve':
            # Permite a cualquier usuario ver la lista de unidades o una unidad específica
            permission_classes = [permissions.AllowAny]
        else:
            # Requiere autenticación para crear, actualizar o eliminar unidades
            permission_classes = [permissions.IsAuthenticated] # O permissions.IsAdminUser si solo los administradores pueden modificarlas
        return [permission() for permission in permission_classes]


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [permissions.IsAdminUser]

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAdminUser]

class FeeTypeViewSet(viewsets.ModelViewSet):
    queryset = FeeType.objects.all()
    serializer_class = FeeTypeSerializer
    permission_classes = [permissions.IsAdminUser]

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [permissions.IsAdminUser]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [permissions.AllowAny] # Residents can view notices
        else:
            permission_classes = [permissions.IsAdminUser] # Only admins can create/edit/delete notices
        return [permission() for permission in permission_classes]

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAdminUser] # Changed to IsAdminUser

    def get_queryset(self):
        # Optionally filter vehicles by resident if needed
        queryset = Vehicle.objects.all()
        resident_id = self.request.query_params.get('resident_id', None)
        if resident_id is not None:
            queryset = queryset.filter(owner_id=resident_id)
        return queryset


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny] # Allow anyone to register
    throttle_classes = [AnonRateThrottle] # Apply rate limiting for anonymous users

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            created_objects = serializer.save()
            return Response(
                {"message": "User registered successfully", "username": created_objects['user'].username},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows groups to be viewed.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer # Use the newly defined GroupSerializer
    permission_classes = [permissions.IsAdminUser] # Only admins can view groups
