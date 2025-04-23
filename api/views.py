from django.core.paginator import EmptyPage, Page, PageNotAnInteger
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse

from .models import Author, Book, Genre
from .utils import filter_books, paginate_books, sort_books


def index(request) -> HttpResponse:
    return HttpResponse("Hello, world. You're at the api index.", status=200)


def get_books(request: HttpRequest) -> JsonResponse:
    """
    Handle GET requests to fetch books with filtering, sorting, and pagination.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    # Extract query parameters (filtering, sorting, pagination)

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

    # Format the result
    result: list[dict] = [
        {
            "id": book.id,
            "title": book.title,
            "author": book.author.name if book.author else None,
            "genres": [genre.name for genre in book.genres.all()],
        }
        for book in page.object_list
    ]

    return JsonResponse(
        {
            "books": result,
            "current_page": page.number,
            "total_pages": page.paginator.num_pages,
            "total_items": page.paginator.count,
        }
    )


def get_authors(request: HttpRequest) -> JsonResponse:
    authors = Author.objects.all()

    result: list[dict] = [
        {
            "id": author.id,
            "name": author.name,
        }
        for author in authors
    ]

    return JsonResponse({"authors": result})


def get_genres(request: HttpRequest) -> JsonResponse:
    genres = Genre.objects.all()

    result: list[dict] = [
        {
            "id": genre.id,
            "name": genre.name,
        }
        for genre in genres
    ]

    return JsonResponse({"genres": result})


def add_book(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    # book_data = request.POST
    return JsonResponse({"message": "Book added successfully!"})
