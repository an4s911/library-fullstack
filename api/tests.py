import json
from datetime import timedelta

from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

# Import models from your app (replace 'library_api' if needed)
from .models import Author, Book, Borrow, Genre
# Import utils from your app (replace 'library_api' if needed)
from .utils import filter_books, paginate_books, sort_books


# --- Test Data Setup Helper Functions ---
def create_author(name="Test Author"):
    return Author.objects.create(name=name)


def create_genre(name="Test Genre"):
    return Genre.objects.create(name=name)


def create_book(
    title="Test Book",
    author=None,
    genres=None,
    allow_borrow=True,
    date_added=None,
):
    book = Book.objects.create(title=title, author=author, allow_borrow=allow_borrow)
    if date_added:
        # Update date_added manually as auto_now_add=True sets it on creation
        Book.objects.filter(pk=book.pk).update(date_added=date_added)
        book.refresh_from_db()  # Refresh to get the updated date

    if genres:
        book.genres.set(genres)
    return book


def create_borrow(
    book,
    borrower_name="Test Borrower",
    is_borrowed=True,
    borrowed_date=None,
    returned_date=None,
):
    if borrowed_date is None:
        borrowed_date = timezone.now()

    borrow = Borrow.objects.create(
        book=book,
        borrower_name=borrower_name,
        is_borrowed=is_borrowed,
        returned_date=returned_date,
    )
    # Update borrowed_date manually if needed, as auto_now_add sets it on creation
    if borrowed_date != borrow.borrowed_date:
        Borrow.objects.filter(pk=borrow.pk).update(borrowed_date=borrowed_date)
        borrow.refresh_from_db()  # Refresh to get the updated date

    return borrow


# --- Tests for Utility Functions ---
class UtilsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.author1 = create_author("Author One")
        cls.author2 = create_author("Author Two")
        cls.genre1 = create_genre("Fiction")
        cls.genre2 = create_genre("Sci-Fi")
        cls.genre3 = create_genre("Mystery")

        cls.book1 = create_book(
            title="Alpha Book",
            author=cls.author1,
            genres=[cls.genre1, cls.genre2],
            date_added=timezone.now().date() - timedelta(days=10),
        )
        cls.book2 = create_book(
            title="Beta Book",
            author=cls.author2,
            genres=[cls.genre2, cls.genre3],
            date_added=timezone.now().date() - timedelta(days=5),
            allow_borrow=False,
        )
        cls.book3 = create_book(
            title="Gamma Story",
            author=cls.author1,
            genres=[cls.genre1],
            date_added=timezone.now().date(),
        )
        cls.book4 = create_book(
            title="Delta Quest", author=None, genres=[cls.genre3]  # No author
        )

        # Borrow book1
        cls.borrow1 = create_borrow(cls.book1, "Borrower A", is_borrowed=True)
        # Borrow and return book3
        cls.borrow2 = create_borrow(
            cls.book3, "Borrower B", is_borrowed=False, returned_date=timezone.now()
        )

    def test_filter_books_no_filters(self):
        """Test filtering with no filters applied."""
        qs = Book.objects.all()
        filters = {}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 4)

    def test_filter_books_by_title(self):
        """Test filtering by title using search query."""
        qs = Book.objects.all()
        filters = {"query": "Book", "search_scope": "title"}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 2)
        self.assertIn(self.book1, filtered_qs)
        self.assertIn(self.book2, filtered_qs)

    def test_filter_books_by_author_name(self):
        """Test filtering by author name using search query."""
        qs = Book.objects.all()
        filters = {"query": "Author One", "search_scope": "author"}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 2)
        self.assertIn(self.book1, filtered_qs)
        self.assertIn(self.book3, filtered_qs)

    def test_filter_books_by_all_scope(self):
        """Test filtering by title or author name using search query."""
        qs = Book.objects.all()
        filters = {"query": "alpha", "search_scope": "all"}  # Title match
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 1)
        self.assertIn(self.book1, filtered_qs)

        filters = {"query": "two", "search_scope": "all"}  # Author match
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 1)
        self.assertIn(self.book2, filtered_qs)

    def test_filter_books_by_author_filter(self):
        """Test filtering by specific author names."""
        qs = Book.objects.all()
        filters = {"authors": ["Author Two"]}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 1)
        self.assertIn(self.book2, filtered_qs)

        filters = {"authors": ["Author One", "Author Two"]}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 3)  # book1, book2, book3

    def test_filter_books_by_genre_filter(self):
        """Test filtering by specific genre names."""
        qs = Book.objects.all()
        filters = {"genres": ["Sci-Fi"]}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 2)
        self.assertIn(self.book1, filtered_qs)
        self.assertIn(self.book2, filtered_qs)

        filters = {"genres": ["Fiction", "Mystery"]}
        filtered_qs = filter_books(qs, filters)
        # Should include book1 (Fiction), book2 (Mystery), book3 (Fiction),
        # book4 (Mystery)
        # .distinct() is crucial here
        self.assertEqual(filtered_qs.count(), 4)

    def test_filter_books_by_borrowed_true(self):
        """Test filtering for currently borrowed books."""
        qs = Book.objects.all()
        filters = {"borrowed": True}
        filtered_qs = filter_books(qs, filters)
        self.assertEqual(filtered_qs.count(), 1)
        self.assertIn(self.book1, filtered_qs)

    def test_filter_books_by_borrowed_false(self):
        """Test filtering for books not currently borrowed."""
        qs = Book.objects.all()
        filters = {"borrowed": False}
        filtered_qs = filter_books(qs, filters)
        # book2 (never borrowed), book3 (returned), book4 (never borrowed)
        self.assertEqual(filtered_qs.count(), 3)
        self.assertIn(self.book2, filtered_qs)
        self.assertIn(self.book3, filtered_qs)
        self.assertIn(self.book4, filtered_qs)

    def test_filter_books_combined(self):
        """Test combining multiple filters."""
        qs = Book.objects.all()
        filters = {
            "query": "Book",
            "search_scope": "title",
            "authors": ["Author One"],
            "genres": ["Sci-Fi"],
            "borrowed": True,
        }
        filtered_qs = filter_books(qs, filters)
        # Only book1 matches: Title contains "Book", Author is "Author One",
        # Genre is "Sci-Fi", and is currently borrowed.
        self.assertEqual(filtered_qs.count(), 1)
        self.assertIn(self.book1, filtered_qs)

    def test_filter_books_distinct(self):
        """
        Ensure distinct results when filtering by multiple genres of the same book.
        """
        qs = Book.objects.all()
        filters = {"genres": ["Fiction", "Sci-Fi"]}  # book1 matches both
        filtered_qs = filter_books(qs, filters)
        # Should include book1, book2, book3
        self.assertEqual(filtered_qs.count(), 3)

    def test_sort_books_by_title(self):
        """Test sorting by title."""
        qs = Book.objects.all()
        sorted_qs_asc = sort_books(qs, "title", desc=False)
        self.assertQuerySetEqual(
            sorted_qs_asc,
            [self.book1, self.book2, self.book4, self.book3],
            transform=lambda x: x,
            ordered=True,
        )

        sorted_qs_desc = sort_books(qs, "title", desc=True)
        self.assertQuerySetEqual(
            sorted_qs_desc,
            [self.book3, self.book4, self.book2, self.book1],
            transform=lambda x: x,
            ordered=True,
        )

    def test_sort_books_by_author(self):
        """
        Test sorting by author name (nulls might sort first or last depending on DB).
        """
        qs = Book.objects.all()
        # Ascending: Nulls first usually, then Author One, Author Two
        sorted_qs_asc = sort_books(qs, "author", desc=False)
        # Descending: Author Two, Author One, Nulls last usually
        sorted_qs_desc = sort_books(qs, "author", desc=True)

        # We check relative order rather than exact position of nulls
        asc_names = [b.author.name if b.author else None for b in sorted_qs_asc]
        desc_names = [b.author.name if b.author else None for b in sorted_qs_desc]

        self.assertIn("Author One", asc_names)
        self.assertIn("Author Two", asc_names)
        self.assertLess(asc_names.index("Author One"), asc_names.index("Author Two"))

        self.assertIn("Author One", desc_names)
        self.assertIn("Author Two", desc_names)
        self.assertLess(desc_names.index("Author Two"), desc_names.index("Author One"))

    def test_sort_books_by_date_added(self):
        """Test sorting by date added."""
        qs = Book.objects.all()
        sorted_qs_asc = sort_books(qs, "date_added", desc=False)
        self.assertQuerySetEqual(
            sorted_qs_asc,
            # Book 4 added last implicitly in setup
            [self.book1, self.book2, self.book3, self.book4],
            transform=lambda x: x,
            ordered=True,
        )

        sorted_qs_desc = sort_books(qs, "date_added", desc=True)
        expected_qs_desc = Book.objects.order_by("-date_added")
        self.assertQuerySetEqual(
            sorted_qs_desc,
            expected_qs_desc,
            transform=lambda x: x,
            ordered=True,
        )

        self.assertQuerySetEqual(
            expected_qs_desc,
            [
                self.book4.date_added,
                self.book3.date_added,
                self.book2.date_added,
                self.book1.date_added,
            ],
            transform=lambda x: x.date_added,
            ordered=True,
        )

    def test_sort_books_invalid_field(self):
        """Test sorting with an invalid field name."""
        # Ensure the initial queryset has a defined order for comparison
        qs = Book.objects.order_by("id")
        sorted_qs = sort_books(qs, "invalid_field")

        # Expected result is the original queryset, still ordered by id
        expected_qs = Book.objects.order_by("id")

        self.assertQuerySetEqual(
            sorted_qs,
            expected_qs,
            transform=lambda x: x,
            ordered=True,  # Now this is valid as both are explicitly ordered
        )

    def test_paginate_books(self):
        """Test pagination logic."""
        qs = Book.objects.order_by("id")  # Ensure consistent order
        page_size = 2

        # Page 1
        page1 = paginate_books(qs, number=1, per_page=page_size)
        self.assertEqual(page1.number, 1)
        self.assertEqual(len(page1.object_list), page_size)
        self.assertEqual(page1.paginator.num_pages, 2)  # 4 items / 2 per page
        self.assertEqual(page1.paginator.count, 4)
        self.assertEqual(page1.object_list[0].id, self.book1.id)
        self.assertEqual(page1.object_list[1].id, self.book2.id)

        # Page 2
        page2 = paginate_books(qs, number=2, per_page=page_size)
        self.assertEqual(page2.number, 2)
        self.assertEqual(len(page2.object_list), page_size)
        self.assertEqual(page2.object_list[0].id, self.book3.id)
        self.assertEqual(page2.object_list[1].id, self.book4.id)

    def test_paginate_books_invalid_page(self):
        """Test requesting a page number that doesn't exist."""
        qs = Book.objects.all()
        from django.core.paginator import EmptyPage

        with self.assertRaises(EmptyPage):
            paginate_books(qs, number=5, per_page=2)

    # Note: PageNotAnInteger is usually caught in the view due to int() conversion


# --- Tests for View Functions ---
class ViewsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client = Client()
        cls.author1 = create_author("View Author One")
        cls.author2 = create_author("View Author Two")
        cls.genre1 = create_genre("View Fiction")
        cls.genre2 = create_genre("View Sci-Fi")

        cls.book1 = create_book(
            title="View Book Alpha",
            author=cls.author1,
            genres=[cls.genre1],
            date_added=timezone.now().date() - timedelta(days=2),
        )
        cls.book2 = create_book(
            title="View Book Beta",
            author=cls.author2,
            genres=[cls.genre1, cls.genre2],
            date_added=timezone.now().date() - timedelta(days=1),
            allow_borrow=False,
        )
        cls.book3 = create_book(
            title="View Book Gamma",
            author=cls.author1,
            genres=[cls.genre2],
            date_added=timezone.now().date(),
        )

        # Borrow book1 for testing borrow-related views
        cls.borrowed_book = cls.book1
        cls.borrower_name = "View Borrower"
        cls.borrow_record = create_borrow(cls.borrowed_book, cls.borrower_name)

        # URLs
        cls.get_books_url = reverse("get_books")
        cls.get_authors_url = reverse("get_authors")
        cls.get_genres_url = reverse("get_genres")
        cls.add_book_url = reverse("add_book")
        cls.borrow_book_url = reverse("borrow_book")
        # URLs requiring IDs need to be constructed in the test methods

    # --- Index View ---
    def test_index_view(self):
        """Test the index view."""
        response = self.client.get(reverse("api_index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Hello, world.")

    # --- get_authors / get_genres Views ---
    def test_get_authors_view(self):
        """Test the get_authors view."""
        # Add another book for author1 to test ordering
        create_book("Another Book", author=self.author1)
        response = self.client.get(self.get_authors_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("authors", data)
        self.assertEqual(len(data["authors"]), 2)
        # Check order (author1 has more books)
        self.assertEqual(data["authors"][0]["name"], self.author1.name)
        self.assertEqual(data["authors"][1]["name"], self.author2.name)

    def test_get_genres_view(self):
        """Test the get_genres view."""
        response = self.client.get(self.get_genres_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("genres", data)
        self.assertEqual(len(data["genres"]), 2)
        # Check order (genre1 and genre2 have equal books initially)
        # Order might depend on ID or name if counts are equal
        genre_names = {g["name"] for g in data["genres"]}
        self.assertEqual(genre_names, {self.genre1.name, self.genre2.name})

    # --- get_book View ---
    def test_get_book_view_success(self):
        """Test getting details for a specific book."""
        url = reverse("get_book", args=[self.book1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.book1.id)
        self.assertEqual(data["title"], self.book1.title)
        self.assertEqual(data["author"]["name"], self.author1.name)
        self.assertEqual(data["genres"][0]["name"], self.genre1.name)
        self.assertTrue(data["allow_borrow"])
        self.assertEqual(data["borrow"]["borrower_name"], self.borrower_name)
        self.assertTrue(data["borrow"]["is_currently_borrowed"])

    def test_get_book_view_not_borrowed(self):
        """Test getting details for a book that is not currently borrowed."""
        url = reverse("get_book", args=[self.book3.id])  # book3 is not borrowed
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.book3.id)
        self.assertIsNone(data["borrow"]["borrower_name"])
        self.assertFalse(data["borrow"]["is_currently_borrowed"])

    def test_get_book_view_not_found(self):
        """Test getting details for a non-existent book."""
        url = reverse("get_book", args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_get_book_view_invalid_method(self):
        """Test get_book view with invalid HTTP method."""
        url = reverse("get_book", args=[self.book1.id])
        response = self.client.post(url)  # Use POST instead of GET
        self.assertEqual(response.status_code, 405)  # Method Not Allowed

    # --- get_books View (Complex - Test key scenarios) ---
    def test_get_books_view_basic(self):
        """Test basic get_books view without parameters."""
        response = self.client.get(self.get_books_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("books", data)
        self.assertIn("current_page", data)
        self.assertIn("total_pages", data)
        self.assertIn("total_items", data)
        self.assertEqual(data["total_items"], 3)
        self.assertEqual(len(data["books"]), 3)  # Default page size is 20

    def test_get_books_view_pagination(self):
        """Test pagination parameters in get_books."""
        response = self.client.get(self.get_books_url, {"pg_num": 1, "pg_size": 2})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["books"]), 2)
        self.assertEqual(data["current_page"], 1)
        self.assertEqual(data["total_pages"], 2)  # 3 items / 2 (max) per page

        response = self.client.get(self.get_books_url, {"pg_num": 2, "pg_size": 2})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["books"]), 1)
        self.assertEqual(data["current_page"], 2)

    def test_get_books_view_pagination_invalid(self):
        """Test invalid pagination parameters."""
        response = self.client.get(self.get_books_url, {"pg_num": "abc"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid parameters", response.json()["error"])

        response = self.client.get(self.get_books_url, {"pg_size": "-5"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("positive integers", response.json()["error"])

        response = self.client.get(
            self.get_books_url, {"pg_size": "100"}
        )  # Exceeds MAX_PAGE_SIZE
        self.assertEqual(response.status_code, 400)
        self.assertIn("Page size cannot exceed", response.json()["error"])

        response = self.client.get(
            self.get_books_url, {"pg_num": 99}
        )  # Page out of range
        self.assertEqual(response.status_code, 404)
        self.assertIn("Invalid page number", response.json()["error"])

    def test_get_books_view_sorting(self):
        """Test sorting parameters in get_books."""
        response = self.client.get(
            self.get_books_url, {"sort_by": "title", "sort_desc": "true"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Titles should be in descending order
        titles = [b["title"] for b in data["books"]]
        self.assertGreater(titles[0], titles[1])  # Basic check assuming enough items

    def test_get_books_view_filtering_author(self):
        """Test author filtering in get_books."""
        response = self.client.get(
            self.get_books_url, {"filter_author": self.author2.name}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 1)
        self.assertEqual(data["books"][0]["author"], self.author2.name)

    def test_get_books_view_filtering_genre(self):
        """Test genre filtering in get_books."""
        response = self.client.get(
            self.get_books_url, {"filter_genre": self.genre2.name}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 2)  # book2 and book3 have genre2
        for book in data["books"]:
            self.assertIn(self.genre2.name, book["genres"])

    def test_get_books_view_filtering_borrowed(self):
        """Test borrowed status filtering in get_books."""
        response = self.client.get(self.get_books_url, {"filter_borrowed": "true"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 1)
        self.assertEqual(data["books"][0]["id"], self.borrowed_book.id)
        self.assertEqual(data["books"][0]["borrower_name"], self.borrower_name)

        response = self.client.get(self.get_books_url, {"filter_borrowed": "false"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # 3 total books - 1 borrowed = 2 not borrowed
        self.assertEqual(data["total_items"], 2)
        for book in data["books"]:
            self.assertIsNone(book["borrower_name"])  # Check the simplified borrow info

    def test_get_books_view_filtering_borrowed_invalid(self):
        """Test invalid borrowed filter value."""
        response = self.client.get(self.get_books_url, {"filter_borrowed": "maybe"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid value for filter_borrowed", response.json()["error"])

    def test_get_books_view_searching(self):
        """Test search parameters in get_books."""
        response = self.client.get(
            self.get_books_url, {"q": "Alpha", "search_in": "title"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 1)
        self.assertEqual(data["books"][0]["title"], self.book1.title)

        response = self.client.get(
            self.get_books_url, {"q": "view author one", "search_in": "author"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 2)  # book1, book3

        response = self.client.get(
            self.get_books_url, {"q": "Beta", "search_in": "all"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_items"], 1)
        self.assertEqual(data["books"][0]["title"], self.book2.title)

    def test_get_books_view_search_invalid_scope(self):
        """Test invalid search scope."""
        response = self.client.get(
            self.get_books_url, {"q": "test", "search_in": "content"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid value for search_in", response.json()["error"])

    def test_get_books_view_combined_params(self):
        """Test combination of filter, sort, search, pagination."""
        # Search for 'View Book', filter by author1, sort by title desc,
        # get page 1 size 1
        params = {
            "q": "View Book",
            "search_in": "title",
            "filter_author": self.author1.name,
            "sort_by": "title",
            "sort_desc": "true",
            "pg_num": 1,
            "pg_size": 1,
        }
        response = self.client.get(self.get_books_url, params)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Expected matches: book1, book3. Sorted desc: gamma, alpha
        self.assertEqual(data["total_items"], 2)
        self.assertEqual(len(data["books"]), 1)
        # Gamma comes before Alpha desc
        self.assertEqual(data["books"][0]["title"], "View Book Gamma")

    # --- add_book View ---
    def test_add_book_view_success_mininal(self):
        """Test adding a book with minimal data (title only)."""
        payload = {"title": "New Test Book"}
        response = self.client.post(
            self.add_book_url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("Book added successfully", data["message"])
        self.assertTrue(Book.objects.filter(title="New Test Book").exists())
        new_book = Book.objects.get(title="New Test Book")
        self.assertIsNone(new_book.author)
        self.assertEqual(new_book.genres.count(), 0)
        self.assertTrue(new_book.allow_borrow)  # Default

    def test_add_book_view_success_full(self):
        """Test adding a book with author, genres, and allow_borrow."""
        payload = {
            "title": "Full New Book",
            "author_id": self.author1.id,
            "genre_ids": [self.genre1.id, self.genre2.id],
            "allow_borrow": False,
        }
        response = self.client.post(
            self.add_book_url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("book_id", data)
        new_book = Book.objects.get(pk=data["book_id"])
        self.assertEqual(new_book.title, "Full New Book")
        self.assertEqual(new_book.author, self.author1)
        self.assertEqual(new_book.genres.count(), 2)
        self.assertIn(self.genre1, new_book.genres.all())
        self.assertIn(self.genre2, new_book.genres.all())
        self.assertFalse(new_book.allow_borrow)

    def test_add_book_view_missing_title(self):
        """Test adding a book with missing title."""
        payload = {"author_id": self.author1.id}
        response = self.client.post(
            self.add_book_url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Title is required", response.json()["error"])

    def test_add_book_view_invalid_json(self):
        """Test adding a book with invalid JSON."""
        response = self.client.post(
            self.add_book_url, data="{invalid json", content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid JSON", response.json()["error"])

    def test_add_book_view_invalid_author(self):
        """Test adding a book with a non-existent author ID."""
        payload = {"title": "Bad Author Book", "author_id": 9999}
        response = self.client.post(
            self.add_book_url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("Author with id 9999 not found", response.json()["error"])

    def test_add_book_view_invalid_genre(self):
        """Test adding a book with a non-existent genre ID."""
        payload = {
            "title": "Bad Genre Book",
            "genre_ids": [self.genre1.id, 9999],
        }
        response = self.client.post(
            self.add_book_url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("Genre with id 9999 not found", response.json()["error"])
        # Check if book was rolled back
        self.assertFalse(Book.objects.filter(title="Bad Genre Book").exists())

    def test_add_book_view_invalid_method(self):
        """Test add_book view with invalid HTTP method."""
        response = self.client.get(self.add_book_url)  # Use GET
        self.assertEqual(response.status_code, 405)

    # --- borrow_book View ---
    def test_borrow_book_view_success(self):
        """Test successfully borrowing an available book."""
        book_to_borrow = self.book3  # This book is available
        payload = {"book_id": book_to_borrow.id, "borrower_name": "New Borrower"}
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("Book borrowed successfully", data["message"])
        self.assertIn("borrow_id", data)
        # Verify borrow record
        self.assertTrue(
            Borrow.objects.filter(
                book=book_to_borrow, borrower_name="New Borrower", is_borrowed=True
            ).exists()
        )

    def test_borrow_book_view_missing_fields(self):
        """Test borrowing with missing book_id or borrower_name."""
        payload = {"borrower_name": "Forgetful Borrower"}  # Missing book_id
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.json()["error"])

        payload = {"book_id": self.book3.id}  # Missing borrower_name
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Missing required fields", response.json()["error"])

    def test_borrow_book_view_not_found(self):
        """Test borrowing a non-existent book."""
        payload = {"book_id": 9999, "borrower_name": "Ghost Borrower"}
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)  # get_object_or_404 raises 404

    def test_borrow_book_view_not_allowed(self):
        """Test borrowing a book where allow_borrow is False."""
        payload = {"book_id": self.book2.id, "borrower_name": "Rule Breaker"}
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 409)  # Conflict
        self.assertIn("not allowed to be borrowed", response.json()["error"])

    def test_borrow_book_view_already_borrowed(self):
        """Test borrowing a book that is already borrowed."""
        payload = {"book_id": self.borrowed_book.id, "borrower_name": "Late Borrower"}
        response = self.client.post(
            self.borrow_book_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 409)  # Conflict
        self.assertIn("already borrowed", response.json()["error"])

    def test_borrow_book_view_invalid_method(self):
        """Test borrow_book view with invalid HTTP method."""
        response = self.client.get(self.borrow_book_url)  # Use GET
        self.assertEqual(response.status_code, 405)

    # --- unborrow_book View ---
    def test_unborrow_book_view_success(self):
        """Test successfully returning (unborrowing) a book."""
        url = reverse("unborrow_book", args=[self.borrowed_book.id])
        response = self.client.put(url)  # No body needed for this PUT
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Book returned successfully", data["message"])
        self.assertEqual(data["borrow_id"], self.borrow_record.id)
        # Verify borrow record update
        self.borrow_record.refresh_from_db()
        self.assertFalse(self.borrow_record.is_borrowed)
        self.assertIsNotNone(self.borrow_record.returned_date)

    def test_unborrow_book_view_not_borrowed(self):
        """Test trying to return a book that isn't currently borrowed."""
        book_not_borrowed = self.book3
        url = reverse("unborrow_book", args=[book_not_borrowed.id])
        response = self.client.put(url)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Book is not currently borrowed", response.json()["error"])

    def test_unborrow_book_view_book_not_found(self):
        """Test trying to return a non-existent book ID."""
        url = reverse("unborrow_book", args=[9999])
        response = self.client.put(url)
        # The query `Borrow.objects.filter(book=9999, is_borrowed=True)` finds nothing
        self.assertEqual(response.status_code, 404)
        self.assertIn("Book is not currently borrowed", response.json()["error"])

    def test_unborrow_book_view_invalid_method(self):
        """Test unborrow_book view with invalid HTTP method."""
        url = reverse("unborrow_book", args=[self.borrowed_book.id])
        response = self.client.post(url)  # Use POST instead of PUT
        self.assertEqual(response.status_code, 405)

    # --- edit_book View ---
    def test_edit_book_view_success_title(self):
        """Test successfully editing a book's title."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"title": "Updated Gamma Title"}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Book updated successfully", data["message"])
        self.assertEqual(data["book"]["title"], "Updated Gamma Title")
        self.book3.refresh_from_db()
        self.assertEqual(self.book3.title, "Updated Gamma Title")

    def test_edit_book_view_success_author(self):
        """Test successfully editing a book's author."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"author_id": self.author2.id}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertEqual(self.book3.author, self.author2)

        # Test setting author to None
        payload = {"author_id": None}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertIsNone(self.book3.author)

    def test_edit_book_view_success_genres(self):
        """Test successfully editing a book's genres."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"genre_ids": [self.genre1.id]}  # Was only genre2
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertEqual(self.book3.genres.count(), 1)
        self.assertIn(self.genre1, self.book3.genres.all())
        self.assertNotIn(self.genre2, self.book3.genres.all())

        # Test setting empty genres
        payload = {"genre_ids": []}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertEqual(self.book3.genres.count(), 0)

    def test_edit_book_view_success_allow_borrow(self):
        """Test successfully editing a book's allow_borrow status."""
        url = reverse("edit_book", args=[self.book3.id])  # Default is True
        payload = {"allow_borrow": False}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertFalse(self.book3.allow_borrow)

    def test_edit_book_view_success_multiple_fields(self):
        """Test editing multiple fields at once."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {
            "title": "Multi Edit",
            "author_id": self.author2.id,
            "genre_ids": [self.genre2.id],
            "allow_borrow": False,
        }
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.book3.refresh_from_db()
        self.assertEqual(self.book3.title, "Multi Edit")
        self.assertEqual(self.book3.author, self.author2)
        self.assertFalse(self.book3.allow_borrow)
        self.assertEqual(self.book3.genres.count(), 1)
        self.assertIn(self.genre2, self.book3.genres.all())

    def test_edit_book_view_book_not_found(self):
        """Test editing a non-existent book."""
        url = reverse("edit_book", args=[9999])
        payload = {"title": "Wont Update"}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)

    def test_edit_book_view_invalid_json(self):
        """Test editing with invalid JSON."""
        url = reverse("edit_book", args=[self.book3.id])
        response = self.client.put(
            url, data="not json", content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid JSON", response.json()["error"])

    def test_edit_book_view_empty_body(self):
        """Test editing with an empty request body."""
        url = reverse("edit_book", args=[self.book3.id])
        response = self.client.put(url, content_type="application/json")  # Empty body
        self.assertEqual(response.status_code, 400)
        self.assertIn("Request body cannot be empty", response.json()["error"])

    def test_edit_book_view_invalid_author_id(self):
        """Test editing with a non-existent author ID."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"author_id": 9999}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("Author with id 9999 not found", response.json()["error"])

    def test_edit_book_view_invalid_genre_id(self):
        """Test editing with a non-existent genre ID in the list."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"genre_ids": [self.genre1.id, 9999]}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 404)  # Helper returns 404
        self.assertIn(
            "Genres with the following ids not found: [9999]", response.json()["error"]
        )

    def test_edit_book_view_invalid_data_type(self):
        """Test editing with incorrect data types."""
        url = reverse("edit_book", args=[self.book3.id])
        payload = {"genre_ids": "not a list"}
        response = self.client.put(
            url, data=json.dumps(payload), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("genre_ids must be a list", response.json()["error"])

    def test_edit_book_view_invalid_method(self):
        """Test edit_book view with invalid HTTP method."""
        url = reverse("edit_book", args=[self.book3.id])
        response = self.client.post(
            url, data=json.dumps({"title": "fail"}), content_type="application/json"
        )  # Use POST
        self.assertEqual(response.status_code, 405)

    # --- delete_book View ---
    def test_delete_book_view_success(self):
        """Test successfully deleting a book."""
        book_to_delete = create_book("To Be Deleted")
        # Create a borrow record to ensure cascade delete works
        create_borrow(book_to_delete)
        borrow_count_before = Borrow.objects.count()
        book_id = book_to_delete.id
        url = reverse("delete_book", args=[book_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(
            f"Book 'To Be Deleted' (ID: {
                book_id}) deleted successfully",
            data["message"],
        )
        # Verify book is deleted
        self.assertFalse(Book.objects.filter(pk=book_id).exists())
        # Verify associated borrow record is deleted (cascade)
        self.assertEqual(Borrow.objects.count(), borrow_count_before - 1)

    def test_delete_book_view_not_found(self):
        """Test deleting a non-existent book."""
        url = reverse("delete_book", args=[9999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Book with id 9999 not found", response.json()["error"])

    def test_delete_book_view_invalid_method(self):
        """Test delete_book view with invalid HTTP method."""
        url = reverse("delete_book", args=[self.book1.id])
        response = self.client.post(url)  # Use POST instead of DELETE
        self.assertEqual(response.status_code, 405)
