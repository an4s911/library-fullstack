from django.core.paginator import Page, Paginator
from django.db.models import Q, QuerySet
from django.db.models.functions import Lower


def filter_books(books: QuerySet, filters: dict) -> QuerySet:
    """
    Apply search and filters to the queryset based on the provided criteria.

    Args:
        books (QuerySet): The queryset to filter.
        filters (dict): A dictionary containing filter and search criteria.
                        Expected keys: 'query', 'search_scope', 'authors',
                        'genres', 'borrowed'.

    Returns:
        QuerySet: The filtered queryset.
    """
    query = filters.get("query")
    search_scope = filters.get("search_scope", "all")  # Default to 'all'
    # one of 'all', 'title', 'author', 'borrower'

    # --- Apply Search First (if query is provided) ---
    if query and query.strip():
        query = query.strip()
        search_q = Q()  # Initialize an empty Q object

        if search_scope == "title":
            search_q = Q(title__icontains=query)
        elif search_scope == "author":
            # Ensure author is not null before searching name
            search_q = Q(author__isnull=False, author__name__icontains=query)
        elif search_scope == "borrower":
            search_q = Q(borrow__isnull=False, borrow__borrower_name__icontains=query)
        else:  # Default 'all' scope
            search_q = (
                Q(title__icontains=query)
                | Q(author__isnull=False, author__name__icontains=query)
                | Q(borrow__isnull=False, borrow__borrower_name__icontains=query)
            )

        # Apply the search Q object to the queryset
        books = books.filter(search_q)

    filter_conditions = {}

    # Extract authors and genres by removing empty strings and whitespace-only strings
    authors = [author for author in filters.get("authors", []) if author.strip()]
    genres = [genre for genre in filters.get("genres", []) if genre.strip()]

    if authors:
        filter_conditions["author__id__in"] = authors

    if genres:
        filter_conditions["genres__id__in"] = genres

    # Apply all filter conditions other than 'borrowed' if present
    if filter_conditions:
        books = books.filter(**filter_conditions)

    borrowed_status = filters.get("borrowed")  # could be 'true' or 'false' or None

    # Filter by borrowed status
    if borrowed_status is True:
        # Only include books that are currently borrowed
        books = books.filter(borrow__is_borrowed=True)
    elif borrowed_status is False:
        # Exclude books that are borrowed
        # Basically, books that are not borrowed or once borrowed and returned
        books = books.exclude(borrow__is_borrowed=True)

    return books.distinct()  # Ensure no duplicate results


def sort_books(books: QuerySet, sort_by: str, desc: bool = False) -> QuerySet:
    """
    Sort the queryset based on the provided sort criteria.

    Args:
        books (QuerySet): The queryset to sort.
        sort_by (str): The field to sort by.
        desc (bool, optional): Whether to sort in descending order. Defaults to False.

    Returns:
        QuerySet: The sorted queryset.
    """

    # Map of sortable fields to their corresponding query pattern
    sortable_fields = {
        "title": "title",
        "author": "author__name",
        "dateAdded": "date_added",
        "borrowerName": "borrow__borrower_name",
        "borrowDate": "borrow__borrowed_date",
        "returnDate": "borrow__returned_date",
    }

    # Get the field to sort by
    field = sortable_fields.get(sort_by)

    # If field is valid, sort by it
    if field:
        if field.startswith("borrow"):
            books = books.filter(Q(borrow__isnull=True) | Q(borrow__is_borrowed=True))

        if sort_by in ["title", "author", "borrowerName"]:
            query_field = Lower(field).desc() if desc else Lower(field)
        else:
            # Prefix for descending is '-'
            prefix = "-" if desc else ""

            query_field = f"{prefix}{field}"

        books = books.order_by(query_field, "id")

    # Otherwise, return the original queryset
    return books.distinct()


def paginate_books(books: QuerySet, number: int, per_page: int) -> Page:
    """
    Paginate the queryset and return the current page and its data.

    Args:
        books (QuerySet): The queryset to paginate.
        number (int): The page number.
        per_page (int): The number of items per page.

    Returns:
        Page: The specific page and its data.

    Raises:
        Exception: If an error occurs during pagination.
    """
    try:
        # check if books is ordered
        if not books.query.order_by:
            books = books.order_by("id")
        paginator: Paginator = Paginator(books, per_page)
        page: Page = paginator.page(number)
    except Exception as e:
        raise e

    return page
