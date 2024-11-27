from django.core.paginator import Page
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Book
from .utils import filter_books, paginate_books, sort_books


def index(request):
    return HttpResponse("Hello, world. You're at the api index.")


@csrf_exempt
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

    # Create a dictionary to hold the filter criteria
    filters: dict = {"authors": filter_authors, "genres": filter_genres}

    # Extract query parameters for sorting (prefixed with sort_)
    sort_by: str = request.GET.get("sort_by", "id")
    sort_desc: bool = request.GET.get("sort_desc", "false") == "true"

    # Extract query parameters for pagination (prefixed with pg_)
    pg_num: int = int(request.GET.get("pg_num", 1))
    pg_size: int = int(request.GET.get("pg_size", 6))

    # Fetch all books
    books: QuerySet = Book.objects.all()

    # Apply filters
    books = filter_books(books, filters)

    # Apply sorting
    books = sort_books(books, sort_by, sort_desc)

    # Apply pagination
    page: Page = paginate_books(books, pg_num, pg_size)

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
