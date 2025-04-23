from django.urls import path

from . import views

urlpatterns = [
    path("get-books/", views.get_books, name="get_books"),
    path("get-authors/", views.get_authors, name="get_authors"),
    path("get-genres/", views.get_genres, name="get_genres"),
    path("search-books/", views.get_books, name="search_books"),
    path("", views.index, name="api_index"),
]
