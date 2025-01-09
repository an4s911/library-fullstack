from django.urls import path

from . import views

urlpatterns = [
    path("get-books/", views.get_books, name="get_books"),
]
