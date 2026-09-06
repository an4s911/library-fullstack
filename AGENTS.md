# AGENTS.md — Library Fullstack

## Project Overview

A personal library management web application for tracking books, authors, genres, and borrowing status. Built as a Django + React monorepo deployed as a single service.

**App Name**: Configurable via `APP_NAME` env var (default: "Library")

---

## Tech Stack

### Backend
- **Framework**: Django 5.1 (Python)
- **Database**: SQLite3 (`db.sqlite3` in project root, or `data/db.sqlite3` if the `data/` directory exists)
- **Static files**: WhiteNoise for serving; Vite builds into `frontend/dist/`, collected to `static/`
- **Auth**: Django's built-in session-based auth with `@login_required` on all API views
- **CSRF**: Standard Django CSRF middleware; frontend reads the `csrftoken` cookie and sends it via `X-CSRFToken` header

### Frontend
- **Framework**: React 18 + TypeScript
- **Build tool**: Vite 5 (outputs to `frontend/dist/frontend/`)
- **Styling**: Tailwind CSS 3 with a custom teal-based `primary` color palette and dark mode (`darkMode: "selector"`)
- **Icons**: `lucide-react`
- **Notifications**: `react-toastify`
- **Path alias**: `@` → `frontend/src/` (configured in `vite.config.ts` and `tsconfig.app.json`)
- **No client-side router** — this is a single-page app with one `HomePage`. Django's catch-all `re_path(".*")` serves the same `index.html` template.

---

## Project Structure

```
library-fullstack/
├── library/              # Django project config
│   ├── settings.py
│   ├── urls.py           # Root URL conf: admin/, api/, frontend catch-all
│   └── wsgi.py / asgi.py
│
├── api/                  # Django app — REST-like JSON API
│   ├── models.py         # Book, Author, Genre, Borrow, Log
│   ├── views.py          # Function-based views returning JsonResponse
│   ├── urls.py           # /api/* routes
│   ├── utils.py          # filter_books, sort_books, paginate_books helpers
│   └── tests.py
│
├── frontend/             # Django app + Vite/React SPA
│   ├── views.py          # Django views: index (serves SPA), login, logout
│   ├── urls.py           # login/, logout/, catch-all → SPA
│   ├── templates/        # Django templates (index.html, login.html)
│   ├── src/              # React source code
│   │   ├── App.tsx       # Root component (Header + HomePage wrapped in providers)
│   │   ├── main.tsx      # Entry point
│   │   ├── index.css     # Global Tailwind styles + component-scoped styles
│   │   ├── components/
│   │   │   ├── Book/         # BookCard, BookModal, AddBookModal, AddBookBtn
│   │   │   ├── Layout/       # Header, BookListGrid, PageNav, LayoutToggleBtn, ThemeToggle
│   │   │   ├── UI/           # Modal, GenericButton, GenericSelect, SimpleDropdown, Tag, Card
│   │   │   ├── SearchFilter/ # Search and filter sidebar components
│   │   │   ├── SkeletonLoaders/
│   │   │   └── Widgets/      # FloatingInfo
│   │   ├── contexts/
│   │   │   ├── OptionsContext.tsx  # Search/filter/sort/pagination state + refresh triggers
│   │   │   └── PageContext.tsx     # Current page + total pages state
│   │   ├── pages/
│   │   │   └── HomePage.tsx       # Main page layout (sidebar + book grid)
│   │   ├── types/
│   │   │   └── index.ts          # Book, Author, Genre types + createBook factory
│   │   └── utils/
│   │       ├── fetchApi.ts       # Thin fetch wrapper with toast/callback support
│   │       ├── getCSRFToken.ts   # Reads csrftoken from document.cookie
│   │       └── book/            # Action handlers: handleBorrow, handleUnborrow,
│   │                              handleDelete, handleChangeAllowBorrow
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.*.json
│
├── manage.py
├── requirements.txt
├── Dockerfile
├── entrypoint.sh
└── db.sqlite3
```

---

## Data Models (`api/models.py`)

| Model    | Key Fields                                                                 | Relations                                    |
|----------|---------------------------------------------------------------------------|----------------------------------------------|
| `Author` | `name` (CharField)                                                        | —                                            |
| `Genre`  | `name` (CharField)                                                        | —                                            |
| `Book`   | `title`, `date_added` (auto), `allow_borrow` (bool)                       | FK → Author (nullable), M2M → Genre          |
| `Borrow` | `borrower_name`, `is_borrowed` (bool), `borrowed_date` (auto), `returned_date` (nullable) | FK → Book (CASCADE)       |
| `Log`    | `datetime`, `description`                                                 | —                                            |

**Borrow constraints:**
- A book can have at most one active borrow (`is_borrowed=True`) at a time (unique constraint).
- If `is_borrowed=True`, then `returned_date` must be null (check constraint).

---

## API Endpoints (`api/urls.py`)

All endpoints require `@login_required`. Request/response format is JSON.

| Method   | Path                        | View              | Purpose                                    |
|----------|-----------------------------|--------------------|---------------------------------------------|
| `GET`    | `/api/get-books/`           | `get_books`        | List books with search, filter, sort, pagination |
| `GET`    | `/api/get-book/<id>/`       | `get_book`         | Single book details + borrow info           |
| `GET`    | `/api/get-authors/`         | `get_authors`      | List all authors (alphabetical)             |
| `GET`    | `/api/get-genres/`          | `get_genres`       | List all genres (alphabetical)              |
| `POST`   | `/api/add-book/`            | `add_book`         | Create a single book                        |
| `POST`   | `/api/add-books/`           | `add_books`        | Bulk import from CSV                        |
| `POST`   | `/api/add-author/`          | `add_author_genre` | Create author (or return existing)          |
| `POST`   | `/api/add-genre/`           | `add_author_genre` | Create genre (or return existing)           |
| `PUT`    | `/api/edit-book/<id>/`      | `edit_book`        | Update book fields (partial update)         |
| `DELETE` | `/api/delete-book/<id>/`    | `delete_book`      | Delete a book                               |
| `PUT`    | `/api/borrow-book/<id>/`    | `borrow_book`      | Mark book as borrowed                       |
| `PUT`    | `/api/unborrow-book/<id>/`  | `unborrow_book`    | Mark book as returned                       |

### `edit_book` API details
Accepts a JSON body with any combination of: `title`, `author_id` (int|null), `genre_ids` (list[int]), `allowBorrow` (bool). Only provided fields are updated. The backend uses helper functions `_update_basic_book_fields`, `_update_book_author`, `_update_book_genres` for modularity.

---

## Frontend Architecture

### Component Hierarchy
```
App
├── PageContextProvider
│   └── OptionsProvider
│       ├── Header
│       │   ├── ThemeToggle
│       │   ├── SearchBar (in SearchFilter/)
│       │   ├── LayoutToggleBtn
│       │   └── AddBookBtn → opens AddBookModal
│       ├── HomePage
│       │   ├── FilterSidebar (in SearchFilter/)
│       │   ├── BookListGrid
│       │   │   └── BookCard[] → opens BookModal on click
│       │   └── PageNav
│       └── ToastContainer
```

### Key Patterns

1. **Modal pattern**: Modals use `createPortal` to render into `<div id="modal">`. The `Modal` component provides the backdrop overlay and close button. Content is passed as children. Modals are opened via local `useState(false)` in the parent.

2. **Data refresh**: Components call `triggerRefresh("books")` or `triggerRefresh("filters")` from `OptionsContext` to signal re-fetching. `BookListGrid` listens to `refreshBooks` in a `useEffect` dependency array.

3. **Book list loading**: `BookListGrid` supports two modes via `bookDisplayMode`:
   - `"paged"` — standard pagination (controlled by `PageNav`)
   - `"all"` — infinite scroll using `IntersectionObserver`

4. **API calls**: All API calls go through `fetchApi()` (a thin wrapper around `fetch`) or direct `fetch()`. The pattern is:
   ```typescript
   fetchApi(url, { method, headers: { "Content-Type": "application/json", "X-CSRFToken": getCSRFToken() }, credentials: "include", body: JSON.stringify(data) }, { okCallback, dataCallback, showToast });
   ```

5. **Type factory**: Raw API book objects are transformed via `createBook()` which parses the date string into a `Date` object and attaches a `getDateAdded()` formatting method.

6. **Form styling**: The `AddBookModal` uses the CSS class `add-book-modal` which has scoped styles in `index.css` for form labels/inputs.

### UI Components (`components/UI/`)

| Component        | Purpose                                                     |
|------------------|-------------------------------------------------------------|
| `Modal`          | Portal-based modal wrapper with backdrop + close button     |
| `GenericButton`  | Reusable button with color variants and size options        |
| `GenericSelect`  | Styled `<select>` dropdown                                  |
| `SimpleDropdown` | Searchable dropdown with "add new" capability               |
| `Tag`            | Pill-shaped label (used for genres)                         |
| `Card`           | Simple styled card container                                |

### Tailwind Color System
- `primary` — Custom teal palette (50–900), with `DEFAULT: "#3a808a"`
- `secondary` — `colors.indigo`
- `success` — `colors.green`
- `error` — `colors.red`
- `warning` — `colors.amber`
- `info` — `colors.sky`
- Dark mode is toggled by a `dark` CSS class on `<html>` (Tailwind's `"selector"` strategy)

---

## Development Workflow

### Running the backend
```bash
# From project root
python manage.py runserver
```

### Running the frontend (dev mode)
```bash
# From frontend/
yarn dev        # Vite dev server with HMR (proxies /api to Django)
```

### Building the frontend for production
```bash
# From frontend/
yarn build      # Outputs to frontend/dist/frontend/
# Then from project root:
python manage.py collectstatic --noinput
```

### Running tests
```bash
# From project root
python manage.py test api
```

### Linting
```bash
# From frontend/
yarn lint       # ESLint
```

---

## Conventions

### Backend
- **Views are function-based**, not class-based. They return `JsonResponse`.
- **No Django REST Framework** — plain Django views with manual JSON serialization.
- **Error responses** follow the pattern: `JsonResponse({"error": "message"}, status=<code>)`.
- **Success responses** follow the pattern: `JsonResponse({"message": "message", ...data}, status=<code>)`.
- **URL naming**: kebab-case for URL paths (`get-books/`, `edit-book/`), snake_case for `name` parameter.

### Frontend
- **File organization**: Components grouped by feature domain (`Book/`, `Layout/`, `UI/`), each with an `index.ts` barrel export.
- **Naming**: PascalCase for components, camelCase for utils/hooks.
- **State management**: React Context for global state (no Redux/Zustand). Local `useState` for component-scoped state.
- **Styling**: Tailwind utility classes inline. Dark mode variants use `dark:` prefix. Global/scoped CSS in `index.css` for complex nested selectors only.
- **No client-side routing library** — all views are in a single page.

---

## Environment Variables

### Root `.env`
- `SECRET_KEY` — Django secret key
- `DEBUG` — `"True"` or `"False"`
- `ALLOWED_HOSTS` — Comma-separated hostnames
- `CSRF_TRUSTED_ORIGINS` — Comma-separated origins
- `APP_NAME` — Display name for the app

### Frontend `.env` (`frontend/.env`)
- `VITE_API_URL` — Backend URL for Vite dev server proxy (e.g., `http://localhost:8000`)
- `VITE_APP_NAME` — App name shown in browser tab
