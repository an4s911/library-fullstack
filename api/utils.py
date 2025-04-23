from django.core.paginator import Page, Paginator
from django.db.models import QuerySet


def filter_books(books: QuerySet, filters: dict) -> QuerySet:
    """
    Apply filters to the queryset based on the provided filter criteria.

    Args:
        books (QuerySet): The queryset to filter.
        filters (dict): A dictionary containing filter criteria.

    Returns:
        QuerySet: The filtered queryset.
    """
    filter_conditions = {}

    # Extract authors and genres by removing empty strings and whitespace-only strings
    authors = [author for author in filters.get("authors", []) if author.strip()]
    genres = [genre for genre in filters.get("genres", []) if genre.strip()]

    if authors:
        filter_conditions["author__name__in"] = authors

    if genres:
        filter_conditions["genres__name__in"] = genres

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
        "date_added": "date_added",
        "borrower_name": "borrow__borrower_name",
        "borrow_date": "borrow__borrowed_date",
        "return_date": "borrow__returned_date",
    }

    # Get the field to sort by
    field = sortable_fields.get(sort_by)

    # If field is valid, sort by it
    if field:
        # Prefix for descending is '-'
        prefix = "-" if desc else ""

        books = books.order_by(f"{prefix}{field}")

    # Otherwise, return the original queryset
    return books


def paginate_books(books: QuerySet, number: int, per_page: int) -> Page:
    """
    Paginate the queryset and return the current page and its data.

    Args:
        books (QuerySet): The queryset to paginate.
        number (int): The page number.
        per_page (int): The number of items per page.

    Returns:
        Page: The specific page and its data.
    """
    paginator: Paginator = Paginator(books, per_page)
    page: Page = paginator.get_page(number)
    return page
