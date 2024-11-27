from django.db.models import (CASCADE, SET_NULL, BooleanField, CharField,
                              DateField, DateTimeField, ForeignKey,
                              ManyToManyField, Model, TextField)


class Author(Model):
    name = CharField(max_length=255)

    def __str__(self):
        return self.name


class Genre(Model):
    name = CharField(max_length=255)

    def __str__(self):
        return self.name


class Book(Model):
    title = CharField(max_length=255)
    date_added = DateField()
    allow_borrow = BooleanField(default=True)
    author = ForeignKey(Author, on_delete=SET_NULL, null=True)
    genres = ManyToManyField(Genre)

    def __str__(self):
        return self.title


class Borrow(Model):
    book = ForeignKey(Book, on_delete=CASCADE)
    is_borrowed = BooleanField(default=True)
    borrower_name = CharField(max_length=255)
    borrowed_date = DateField()
    returned_date = DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.borrower_name} - {self.book.title}"


class Log(Model):
    datetime = DateTimeField()
    description = TextField()

    def __str__(self):
        return self.description
