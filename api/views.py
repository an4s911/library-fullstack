import json

from django.core.paginator import EmptyPage, Page, PageNotAnInteger
from django.db.models import Count, QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404

from .models import Author, Book, Borrow, Genre
from .utils import filter_books, paginate_books, sort_books


def index(request) -> HttpResponse:
    return HttpResponse("Hello, world. You're at the api index.", status=200)


def get_books(request: HttpRequest) -> JsonResponse:
    """
    Handle GET requests to fetch books with filtering, sorting, and pagination.

    Query Parameters:
    - Search:
        - `q` (str, optional): Search query term.
        - `search_in` (str, optional): Scope of the search. Options: 'all' (default),
          'title', 'author'.
    - Filtering:
        - `filter_author` (str, optional, repeatable): Filters books by author name(s).
          Can be provided multiple times (
              e.g., ?filter_author=Author One&filter_author=Author Two).
        - `filter_genre` (str, optional, repeatable): Filters books by genre name(s).
          Can be provided multiple times (
              e.g., ?filter_genre=Fiction&filter_genre=Sci-Fi).
        - `filter_borrowed` (str, optional): Filter books by whether they are borrowed.
          Set to 'true' to include borrowed books, 'false' to exclude borrowed books.
          Defaults to 'null'.
    - Sorting:
        - `sort_by` (str, optional): Field to sort books by. Defaults to 'id'.
          Common options: 'title', 'author', 'date_added', 'borrower_name'.
        - `sort_desc` (str, optional):
                Set to 'true' for descending order, 'false' (or omit) for ascending.
          Defaults to 'false'.
    - Pagination:
        - `pg_num` (int, optional): The page number to retrieve. Defaults to 1.
        - `pg_size` (int, optional): The number of books per page. Defaults to 20.

    Returns:
        JsonResponse: A JSON object containing:
            - `books`: A list of book objects for the requested page.
            - `current_page`: The current page number.
            - `total_pages`: The total number of pages available.
            - `total_items`: The total number of books matching the filters.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    # Extract query parameters (search, filtering, sorting, pagination)
    # Search parameters
    search_query: str | None = request.GET.get("q", None)
    search_scope: str = request.GET.get("search_in", "all").lower()

    # Validate search_scope
    allowed_search_scopes = ["all", "title", "author"]
    if search_scope not in allowed_search_scopes:
        return JsonResponse(
            {
                "error": f"Invalid value for search_in parameter. Allowed values: {
                    ', '.join(allowed_search_scopes)}"
            },
            status=400,
        )

    # Extract query parameters for filtering (prefixed with filter_)
    filter_authors: list[str] = request.GET.getlist("filter_author", [])
    filter_genres: list[str] = request.GET.getlist("filter_genre", [])
    filter_borrowed_q: str = request.GET.get("filter_borrowed", "null").lower()

    # Validate filter_borrowed parameter
    allowed_filter_borrowed_values = ["true", "false", "null"]
    if filter_borrowed_q not in allowed_filter_borrowed_values:
        return JsonResponse(
            {
                "error": (
                    f"Invalid value for filter_borrowed parameter. Allowed values: {
                        ', '.join(allowed_filter_borrowed_values)}"
                )
            },
            status=400,
        )

    # Convert filter_borrowed parameter to boolean if provided
    # If filter_borrowed_q is not "true" or "false", set it to None
    filter_borrowed = (
        filter_borrowed_q == "true" if filter_borrowed_q in ["true", "false"] else None
    )

    # Create a dictionary to hold the filter criteria
    filters: dict = {
        "query": search_query,
        "search_scope": search_scope,
        "authors": filter_authors,
        "genres": filter_genres,
        "borrowed": filter_borrowed,
    }

    # Extract query parameters for sorting (prefixed with sort_)
    sort_by: str = request.GET.get("sort_by", "id")
    sort_desc: bool = request.GET.get("sort_desc", "false").lower() == "true"

    try:
        # Extract query parameters for pagination (prefixed with pg_)
        pg_num_str: str = request.GET.get("pg_num", "1")
        pg_size_str: str = request.GET.get("pg_size", "20")

        pg_num: int = int(pg_num_str)
        pg_size: int = int(pg_size_str)

        if pg_num < 1 or pg_size < 1:
            return JsonResponse(
                {
                    "error": (
                        "Page number (pg_num) and page size (pg_size) "
                        "must be positive integers."
                    )
                },
                status=400,
            )

        MAX_PAGE_SIZE = 50

        if pg_size > MAX_PAGE_SIZE:
            return JsonResponse(
                {"error": f"Page size cannot exceed {MAX_PAGE_SIZE}."}, status=400
            )

    except ValueError:
        return JsonResponse(
            {"error": "Invalid parameters: pg_num and pg_size must be integers."},
            status=400,
        )

    # Fetch, filter, sort, paginate
    books_qs: QuerySet = (
        Book.objects.select_related("author")
        .prefetch_related("genres", "borrow_set")
        .all()
    )

    books_qs = filter_books(books_qs, filters)  # Apply filters
    books_qs = sort_books(books_qs, sort_by, sort_desc)  # Apply sorting

    # Paginate
    try:
        page: Page = paginate_books(books_qs, pg_num, pg_size)
    except PageNotAnInteger:
        return JsonResponse({"error": "Page number must be an integer."}, status=400)
    except EmptyPage:
        # Return 404 if the requested page is out of range
        return JsonResponse(
            {"error": f"Invalid page number. Page {pg_num} does not exist."}, status=404
        )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": "An error occurred. Please try again."}, status=500
        )

    # Prepare and return the response
    result: list[dict] = []

    for book in page.object_list:
        borrow_info = book.borrow_set.filter(is_borrowed=True).first()

        borrower_name: str | None = borrow_info.borrower_name if borrow_info else None
        result.append(
            {
                "id": book.id,
                "title": book.title,
                "author": book.author.name if book.author else None,
                "genres": [genre.name for genre in book.genres.all()],
                "borrower_name": borrower_name,
            }
        )

    return JsonResponse(
        {
            "books": result,
            "current_page": page.number,
            "total_pages": page.paginator.num_pages,
            "total_items": page.paginator.count,
        }
    )


def get_book(request: HttpRequest, book_id: int) -> JsonResponse:
    """
    Handle GET requests to fetch details for a specific book, including borrow history.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    # Use get_object_or_404 for cleaner handling of Not Found
    book = get_object_or_404(Book, pk=book_id)

    try:
        # Fetch borrow for book with is_borrowed=True
        borrow = Borrow.objects.filter(book=book, is_borrowed=True).first()

        # Convert borrow object to dictionary
        borrow_info_dict = (
            {
                "id": borrow.id,
                "borrower_name": borrow.borrower_name,
                "borrowed_date": borrow.borrowed_date.isoformat(),
                "is_currently_borrowed": borrow.is_borrowed,
            }
            if borrow
            else {
                "id": None,
                "borrower_name": None,
                "borrowed_date": None,
                "is_currently_borrowed": False,
            }
        )

        # Format the result for the specific book
        result = {
            "id": book.id,
            "title": book.title,
            "author": (
                {"id": book.author.id, "name": book.author.name}
                if book.author
                else None
            ),
            "genres": [
                {"id": genre.id, "name": genre.name} for genre in book.genres.all()
            ],
            "allow_borrow": book.allow_borrow,
            "date_added": book.date_added.isoformat(),
            "borrow": borrow_info_dict,
        }

        return JsonResponse(result)

    except Exception as e:
        # Log the exception e for debugging
        print(f"Unexpected error in get_book: {e}")  # Basic logging
        return JsonResponse(
            {"error": "An unexpected server error occurred"}, status=500
        )


def get_authors(request: HttpRequest) -> JsonResponse:
    # order by number of books
    authors = (
        Author.objects.annotate(book_count=Count("book")).order_by("-book_count").all()
    )
    result: list[dict] = [{"id": author.id, "name": author.name} for author in authors]
    return JsonResponse({"authors": result})


def get_genres(request: HttpRequest) -> JsonResponse:
    # order by number of books
    genres = (
        Genre.objects.annotate(book_count=Count("book")).order_by("-book_count").all()
    )
    result: list[dict] = [{"id": genre.id, "name": genre.name} for genre in genres]
    return JsonResponse({"genres": result})


def add_book(request: HttpRequest) -> JsonResponse:
    """
    Adds a new book. Expects JSON data in the request body.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        title = data.get("title")
        author_id = data.get("author_id")
        genre_ids = data.get("genre_ids", [])  # List of genre IDs
        allow_borrow = data.get("allow_borrow", True)

        if not title:
            return JsonResponse({"error": "Title is required"}, status=400)

        # --- Find Author (optional) ---
        author = None
        if author_id:
            try:
                author = Author.objects.get(pk=author_id)
            except Author.DoesNotExist:
                return JsonResponse(
                    {"error": f"Author with id {author_id} not found"}, status=404
                )

        # --- Create Book ---
        book = Book(title=title, author=author, allow_borrow=allow_borrow)
        book.save()  # Save first to get an ID for M2M relationships

        # --- Find and Set Genres (optional) ---
        if genre_ids:
            genres = []
            for genre_id in genre_ids:
                try:
                    genre = Genre.objects.get(pk=genre_id)
                    genres.append(genre)
                except Genre.DoesNotExist:
                    # Rollback or handle error: Decide if adding book should fail if a
                    # genre is invalid
                    book.delete()  # Simple rollback: delete the created book
                    return JsonResponse(
                        {"error": f"Genre with id {genre_id} not found"}, status=404
                    )
            book.genres.set(genres)

        return JsonResponse(
            {"message": "Book added successfully!", "book_id": book.id}, status=201
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        print(e)
        # Log the exception e
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)


def delete_book(request: HttpRequest, book_id: int) -> JsonResponse:
    """
    Deletes a book and its associated borrow records (due to on_delete=CASCADE).
    Requires book_id in the URL path.
    """
    if request.method != "DELETE":
        return JsonResponse(
            {"error": "Invalid request method. Use DELETE."}, status=405
        )

    try:
        book = Book.objects.get(pk=book_id)
        book_title = book.title  # Get title for the message before deleting
        book.delete()
        # Note: Associated Borrow records are automatically deleted due to
        # on_delete=CASCADE

        return JsonResponse(
            {"message": f"Book '{book_title}' (ID: {book_id}) deleted successfully."},
            status=200,
        )
        # Alternative: return HttpResponse(status=204) # No Content is common for DELETE

    except Book.DoesNotExist:
        return JsonResponse({"error": f"Book with id {book_id} not found"}, status=404)
    except Exception as e:
        print(e)
        # Log the exception e
        return JsonResponse(
            {"error": "An unexpected error occurred during deletion"}, status=500
        )


def borrow_book(request: HttpRequest) -> JsonResponse:
    """
    Marks a book as borrowed by creating a Borrow record.
    Expects JSON: {"book_id": int, "borrower_name": str}
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        book_id = data.get("book_id")
        borrower_name = data.get("borrower_name")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    # --- Validate Input ---
    if not all([book_id, borrower_name]):  # Check  for book_id and borrower_name
        return JsonResponse(
            {"error": "Missing required fields: book_id, borrower_name"}, status=400
        )

    book = get_object_or_404(Book, pk=book_id)

    if not book.allow_borrow:
        # 409 Conflict
        return JsonResponse(
            {"error": "This book is not allowed to be borrowed"}, status=409
        )

    try:
        # Check if already borrowed (active borrow record exists)
        if Borrow.objects.filter(book=book, is_borrowed=True).exists():
            # 409 Conflict
            return JsonResponse({"error": "Book is already borrowed"}, status=409)

        # --- Create Borrow Record ---
        # borrowed_date is automatically set by the model
        borrow = Borrow(
            book=book,
            borrower_name=borrower_name,
            is_borrowed=True,
        )
        borrow.save()

        return JsonResponse(
            {"message": "Book borrowed successfully!", "borrow_id": borrow.id},
            status=201,
        )

    except Exception as e:
        # Log the exception e
        print(f"Unexpected error in set_borrow: {e}")  # Basic logging
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)
