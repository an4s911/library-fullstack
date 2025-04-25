from django.db.models import (CASCADE, SET_NULL, BooleanField, CharField,
                              CheckConstraint, DateField, DateTimeField,
                              ForeignKey, ManyToManyField, Model, Q, TextField,
                              UniqueConstraint)


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
    date_added = DateTimeField(auto_now_add=True)
    allow_borrow = BooleanField(default=True)
    author = ForeignKey(Author, on_delete=SET_NULL, null=True, blank=True)
    genres = ManyToManyField(Genre)

    def __str__(self):
        return self.title


class Borrow(Model):
    book = ForeignKey(Book, on_delete=CASCADE)
    is_borrowed = BooleanField(default=True)
    borrower_name = CharField(max_length=255)
    borrowed_date = DateTimeField(auto_now_add=True)
    returned_date = DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            CheckConstraint(
                # This condition enforces that either:
                # 1. The item is NOT borrowed (is_borrowed=False)
                # OR
                # 2. The returned_date is NULL (not set)
                # It prevents the state where is_borrowed=True AND returned_date is
                # NOT NULL.
                check=Q(is_borrowed=False) | Q(returned_date__isnull=True),
                # Choose a descriptive name for the constraint
                name="borrow_returned_implies_not_borrowed_check",
            ),
            UniqueConstraint(
                fields=["book"],  # Enforce uniqueness on the 'book' field
                # Apply this constraint ONLY when 'is_borrowed' is True
                condition=Q(is_borrowed=True),
                name="borrow_unique_active_borrow_per_book",
            ),
        ]

    def __str__(self):
        return (
            f"{self.borrower_name} - {self.book.title}"
            + " "
            + f"({'borrowed' if self.is_borrowed else 'returned'})"
        )


class Log(Model):
    datetime = DateTimeField()
    description = TextField()

    def __str__(self):
        return self.description
