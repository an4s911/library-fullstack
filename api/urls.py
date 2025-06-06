from django.urls import path

from . import views

urlpatterns = [
    path("get-books/", views.get_books, name="get_books"),
    path("get-authors/", views.get_authors, name="get_authors"),
    path("get-genres/", views.get_genres, name="get_genres"),
    path("get-book/<int:book_id>/", views.get_book, name="get_book"),
    path("search-books/", views.get_books, name="search_books"),
    path("add-book/", views.add_book, name="add_book"),
    path("add-author/", views.add_author_genre, {"type": "author"}, name="add_author"),
    path("add-genre/", views.add_author_genre, {"type": "genre"}, name="add_genre"),
    path("borrow-book/<int:book_id>/", views.borrow_book, name="borrow_book"),
    path("unborrow-book/<int:book_id>/", views.unborrow_book, name="unborrow_book"),
    path("edit-book/<int:book_id>/", views.edit_book, name="edit_book"),
    path("delete-book/<int:book_id>/", views.delete_book, name="delete_book"),
    path("add-books/", views.add_books, name="add_books"),
    path("", views.index, name="api_index"),
]
