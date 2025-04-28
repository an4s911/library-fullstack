from django.urls import path, re_path

from . import views

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    re_path(".*", views.index, name="frontend_index"),
]
