from django.urls import path
from api import views

urlpatterns = [
    path("api/videos", views.get_videos, name="get_videos"),
    path('api/generate-course/', views.generate_course, name='generate_course'),
]
