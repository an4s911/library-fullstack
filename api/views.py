import json

from django.core.exceptions import ValidationError
from django.core.paginator import EmptyPage, Page, PageNotAnInteger
from django.db.models import Count, QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

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
    allowed_search_scopes = ["all", "title", "author", "borrower"]
    if search_scope not in allowed_search_scopes:
        return JsonResponse(
            {
                "error": f"Invalid value for search_in parameter. Allowed values: {
                    ', '.join(allowed_search_scopes)}"
            },
            status=400,
        )

    # Extract query parameters for filtering (prefixed with filter_)
    filter_authors: list[str] = request.GET.get("filter_author", "").split(",")
    filter_genres: list[str] = request.GET.get("filter_genre", "").split(",")
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
    sort_by: str = request.GET.get("sort_by", "title")
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
                "author": (
                    {"id": book.author.id, "name": book.author.name}
                    if book.author
                    else None
                ),
                "dateAdded": book.date_added.isoformat(),
                "genres": [genre.name for genre in book.genres.all()],
                "borrowerName": borrower_name,
                "allowBorrow": book.allow_borrow,
            }
        )

    return JsonResponse(
        {
            "books": result,
            "currentPage": page.number,
            "totalPages": page.paginator.num_pages,
            "totalItems": page.paginator.count,
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
                "borrowerName": borrow.borrower_name,
                "borrowedDate": borrow.borrowed_date.isoformat(),
                "isCurrentlyBorrowed": borrow.is_borrowed,
            }
            if borrow
            else {
                "id": None,
                "borrowerName": None,
                "borrowedDate": None,
                "isCurrentlyBorrowed": False,
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
            "allowBorrow": book.allow_borrow,
            "dateAdded": book.date_added.isoformat(),
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
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    title = data.get("title")
    author_id = data.get("author")
    genre_ids = data.get("genres", [])
    allow_borrow = data.get("allowBorrow", "true") == "true"

    if not title:
        return JsonResponse({"error": "Title is required"}, status=400)

    author = None
    try:
        if author_id:
            author = Author.objects.get(pk=author_id)
    except Author.DoesNotExist:
        return JsonResponse(
            {"error": f"Author with id {author_id} not found"}, status=404
        )

    # --- Find and Set Genres (optional) ---
    if genre_ids:
        genre_objects = Genre.objects.filter(pk__in=genre_ids)

        if len(genre_objects) != len(genre_ids):
            return JsonResponse(
                {"error": "Invalid genre_ids provided"},
                status=404,
            )

    else:
        return JsonResponse({"error": "At least one genre is required"}, status=400)

    try:
        # --- Create Book ---
        book = Book(title=title, author=author, allow_borrow=allow_borrow)
        book.save()
        book.genres.set(genre_objects)
    except Exception as e:
        print(f"Unexpected error in add_book: {e}")
        return JsonResponse({"error": "Something went wrong"}, status=500)

    return JsonResponse(
        {"message": "Book added successfully!", "book_id": book.id}, status=201
    )


def add_author_genre(request: HttpRequest, type=None) -> JsonResponse:
    """
    Adds a new author/genre.

    Expects JSON data in the request body.

    Request:
    {
        "name": "John Doe"
    }
    OR
    {
        "name": "Fiction"
    }

    Response:
    {
        "message": "Author added successfully!",
        "author": {
            "id": 1,
            "name": "John Doe"
        }
    }
    OR
    {
        "message": "Genre added successfully!",
        "genre": {
            "id": 1,
            "name": "Fiction"
        }
    }

    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    name = data.get("name")

    if not name:
        return JsonResponse({"error": "Name is required"}, status=400)

    models_choise = {
        "author": Author,
        "genre": Genre,
    }

    model = models_choise.get(type)

    if not model:
        raise ValueError(f"Invalid type: {type}")

    try:
        # Check if the object already exists
        existing_object = model.objects.filter(name__iexact=name.strip()).first()
        if existing_object:
            return JsonResponse(
                {
                    "message": f"{type.capitalize()} already exists!",
                    type: {"id": existing_object.id, "name": existing_object.name},
                },
                status=200,
            )

        new_object = model(name=name)
        new_object.save()
        return JsonResponse(
            {
                "message": f"{type.capitalize()} added successfully!",
                type: {"id": new_object.id, "name": new_object.name},
            },
            status=201,
        )
    except Exception as e:
        print(f"Unexpected error in add_author_genre: {e}")
        return JsonResponse({"error": "Something went wrong"}, status=500)


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


def borrow_book(request: HttpRequest, book_id: int) -> JsonResponse:
    """
    Marks a book as borrowed by creating a Borrow record.
    Expects JSON: {"borrowerName": str}
    """
    if request.method != "PUT":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        borrower_name = data.get("borrowerName")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    # --- Validate Input ---
    if not borrower_name:
        return JsonResponse(
            {"error": "Missing required field borrowerName"}, status=400
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
            {
                "message": "Book borrowed successfully!",
                "borrowName": borrow.borrower_name,
            },
            status=201,
        )

    except Exception as e:
        # Log the exception e
        print(f"Unexpected error in set_borrow: {e}")  # Basic logging
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)


def unborrow_book(request: HttpRequest, book_id: int) -> JsonResponse:
    """
    Marks a specific borrow record as returned.
    Requires borrow_id in the URL path.
    """
    # Note: Typically PUT or PATCH. Using PUT here for simplicity.
    if request.method != "PUT":
        return JsonResponse({"error": "Invalid request method. Use PUT."}, status=405)

    try:
        # --- Find Borrow Record ---
        borrow = Borrow.objects.filter(book=book_id, is_borrowed=True).first()

        if not borrow:
            # book currently not borrowed
            return JsonResponse({"error": "Book is not currently borrowed"}, status=404)

        returned_date = timezone.now()

        # --- Update Borrow Record ---
        if returned_date < borrow.borrowed_date:
            return JsonResponse(
                {"error": "Returned date cannot be earlier than borrowed date"},
                status=400,
            )

        borrow.is_borrowed = False
        borrow.returned_date = returned_date
        borrow.save()

        return JsonResponse(
            {"message": "Book returned successfully!", "borrow_id": borrow.id},
            status=200,
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        print(e)
        # Log the exception e
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)


# --- Helper Functions for edit_book ---
def _update_basic_book_fields(book: Book, data: dict) -> JsonResponse | None:
    """Updates basic fields like title and allow_borrow."""
    if "title" in data:
        title = data["title"]
        if not title:  # Basic validation
            return JsonResponse({"error": "Title cannot be empty"}, status=400)
        book.title = title

    if "allowBorrow" in data:
        # Ensure it's explicitly converted to bool
        allow_borrow_value = data["allowBorrow"]
        if not isinstance(allow_borrow_value, bool):
            # You might want stricter type checking depending on input source
            allow_borrow_value = str(allow_borrow_value).lower() in ("true", "1", "yes")

        # Check if the book is borrowed, and if it is borrwed, then cannot set
        # allow_borrow to false
        if not allow_borrow_value and book.borrow_set.filter(is_borrowed=True).exists():
            return JsonResponse(
                {
                    "error": (
                        "Cannot set allow_borrow to false while the book is borrowed"
                    )
                },
                status=400,
            )
        else:
            book.allow_borrow = allow_borrow_value
    return None  # Indicate success


def _update_book_author(book: Book, data: dict) -> JsonResponse | None:
    """Updates the book's author."""
    if "author_id" in data:
        author_id = data["author_id"]
        if author_id is None:
            book.author = None
        else:
            try:
                # Ensure author_id is an integer if it's not None
                author_id_int = int(author_id)
                author = Author.objects.get(pk=author_id_int)
                book.author = author
            except Author.DoesNotExist:
                return JsonResponse(
                    {"error": f"Author with id {author_id} not found"}, status=404
                )
            except (ValueError, TypeError):
                return JsonResponse(
                    {"error": f"Invalid author_id format: {author_id}"}, status=400
                )
    return None  # Indicate success


def _update_book_genres(book: Book, data: dict) -> JsonResponse | None:
    """Updates the book's genres."""
    if "genre_ids" in data:
        genre_ids = data["genre_ids"]
        if not isinstance(genre_ids, list):
            return JsonResponse({"error": "genre_ids must be a list"}, status=400)

        # Validate and fetch all genres at once
        valid_genre_ids = []
        for gid in genre_ids:
            try:
                valid_genre_ids.append(int(gid))
            except (ValueError, TypeError):
                return JsonResponse(
                    {"error": f"Invalid genre_id format in list: {gid}"}, status=400
                )

        # Fetch genres matching the provided IDs
        genres = list(Genre.objects.filter(pk__in=valid_genre_ids))

        # Check if all requested genres were found
        if len(genres) != len(valid_genre_ids):
            # Find which IDs were missing (more informative error)
            found_ids = {genre.id for genre in genres}
            missing_ids = [gid for gid in valid_genre_ids if gid not in found_ids]
            return JsonResponse(
                {"error": f"Genres with the following ids not found: {missing_ids}"},
                status=404,  # Or 400, arguably bad data provided by client
            )

        book.genres.set(genres)  # .set() handles add/remove efficiently
    return None  # Indicate success


def edit_book(request: HttpRequest, book_id: int) -> JsonResponse:
    """
    Handles PUT requests to edit an existing book identified by `book_id`.

    Updates specified fields of the book based on the JSON data provided in the
    request body. Uses helper functions for modularity. Fields not included in
    the request body will remain unchanged.

    URL Parameters:
        - `book_id` (int): The primary key of the book to edit.

    Request Body (JSON):
        An object containing the fields to update. All fields are optional.
        - `title` (str, optional): The new title for the book. Cannot be empty if
           provided.
        - `author_id` (int | None, optional): The ID of the new author for the book.
          Providing `null` or omitting the key removes the author association.
        - `genre_ids` (list[int], optional): A list of IDs for the genres to associate
          with the book. This will replace the existing set of genres. An empty list
          `[]` removes all genre associations.
        - `allowBorrow` (bool, optional): Set to `true` or `false` to update the
          borrowing permission for the book. Accepts boolean `true`/`false` or
          string representations like "true", "false", "1", "0".

    Successful Response (200 OK):
        A JSON object containing:
        - `message` (str): A confirmation message (e.g., "Book updated successfully!").
        - `book` (dict): An object representing the updated state of the book,
           including:
            - `id` (int): The book's ID.
            - `title` (str): The updated title.
            - `author` (str | None): The name of the updated author, or None.
            - `genres` (list[str]): A list of names of the updated associated genres.
            - `allowBorrow` (bool): The updated borrow status.

    Error Responses:
        - 400 Bad Request:
            - Invalid JSON data in the request body.
            - Request body is empty.
            - Invalid data types for fields (e.g., `genre_ids` not a list, `author_id`
              not integer/null).
            - Validation error during `book.full_clean()` (e.g., empty title).
            - Missing required data if a specific field requires it (though all are
              optional here for PUT partial updates).
        - 404 Not Found:
            - Book with the specified `book_id` does not exist.
            - An `author_id` provided in the request body does not exist.
            - One or more `genre_ids` provided in the request body do not exist.
        - 405 Method Not Allowed:
            - Request method is not PUT.
        - 500 Internal Server Error:
            - An unexpected error occurred on the server.
    """
    if request.method != "PUT":
        return JsonResponse({"error": "Invalid request method. Use PUT."}, status=405)

    try:
        book = Book.objects.get(pk=book_id)
    except Book.DoesNotExist:
        return JsonResponse({"error": f"Book with id {book_id} not found"}, status=404)

    try:
        # Ensure request body is not empty before trying to parse
        if not request.body:
            return JsonResponse(
                {"error": "Request body cannot be empty for PUT"}, status=400
            )
        data = json.loads(request.body)
        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "Invalid JSON data: Expected an object"}, status=400
            )

        # --- Call helper functions to update parts of the book ---
        # Each helper returns a JsonResponse on error, otherwise None
        error_response = _update_basic_book_fields(book, data)
        if error_response:
            return error_response

        error_response = _update_book_author(book, data)
        if error_response:
            return error_response

        error_response = _update_book_genres(book, data)
        if error_response:
            return error_response

        # --- Save if all updates were successful ---
        book.full_clean()  # Run model validation before saving
        book.save()

        # --- Format and return success response ---
        updated_book_data = {
            "id": book.id,
            "title": book.title,
            "author": (
                {"id": book.author.id, "name": book.author.name}
                if book.author
                else None
            ),
            "dateAdded": book.date_added.isoformat(),
            "genres": [genre.name for genre in book.genres.all()],
            "allowBorrow": book.allow_borrow,
        }
        return JsonResponse(
            {"message": "Book updated successfully!", "book": updated_book_data},
            status=200,
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except ValidationError as ve:
        print(ve)
        # Catches validation errors from book.full_clean() or potentially save()
        return JsonResponse(
            {"error": f"Validation Error: {ve.message_dict}"}, status=400
        )
    except Exception as e:
        # Log the exception e for debugging
        print(f"Unexpected error in edit_book: {e}")  # Basic logging
        # Consider using Python's logging module for production
        # import logging
        # logging.exception("An unexpected error occurred during book edit")
        return JsonResponse(
            {"error": "An unexpected server error occurred"}, status=500
        )
