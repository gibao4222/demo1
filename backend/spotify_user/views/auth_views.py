from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from spotify_user.models import SpotifyUser
from allauth.socialaccount.models import SocialAccount
from django.shortcuts import render


class SocialLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        provider = request.data.get('provider')
        token = request.data.get('access_token')
        
        if not provider or not token:
            return Response({'error': 'Provider and access token are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            social_account = SocialAccount.objects.get(provider=provider, uid=token)
            user = social_account.user
            spotify_user, created = SpotifyUser.objects.get_or_create(
                email=user.email,
                default={
                    'username': user.username or user.email.split('@')[0],
                    'social_id': token,
                    'provider': provider,
                    'password': None
                }
            )
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        except SocialAccount.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class LoginPageView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return render(request, 'login.html')

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if SpotifyUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = SpotifyUser(
            username=username,
            email=email,
            is_active=True,
            vip=False,
            role='user'
        )
        user.set_password(password)
        user.save()

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = SpotifyUser.objects.get(username=username)
            if not user.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except SpotifyUser.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)