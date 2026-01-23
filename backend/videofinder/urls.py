"""
URL configuration for videofinder project.
"""

from django.urls import path
from api import views

urlpatterns = [
    path("api/videos", views.get_videos, name="get_videos"),
]
