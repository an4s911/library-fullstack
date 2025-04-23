from django.urls import path

from . import views

urlpatterns = [
    path("get-books/", views.get_books, name="get_books"),
    path("get-authors/", views.get_authors, name="get_authors"),
    path("get-genres/", views.get_genres, name="get_genres"),
    path("get-book/<int:book_id>/", views.get_book, name="get_book"),
    path("search-books/", views.get_books, name="search_books"),
    path("add-book/", views.add_book, name="add_book"),
    path("delete-book/<int:book_id>/", views.delete_book, name="delete_book"),
    path("", views.index, name="api_index"),
]
