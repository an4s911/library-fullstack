from django.contrib import admin

from .models import Author, Book, Borrow, Genre, Log

# Register your models here.

admin.site.register(Book)
admin.site.register(Author)
admin.site.register(Genre)
admin.site.register(Log)
admin.site.register(Borrow)
