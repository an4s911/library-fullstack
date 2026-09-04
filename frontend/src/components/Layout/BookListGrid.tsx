import { RefObject, useEffect, useRef, useState } from "react";
import { BookCard } from "@/components/Book";
import { BookListGridLoader } from "@/components/SkeletonLoaders";
import { Book, createBook } from "@/types";
import { BookXIcon, LoaderCircle } from "lucide-react";
import { useOptions, usePageContext } from "@/contexts";

type BookListGridProps = {
    isGrid: boolean;
    scrollContainerRef: RefObject<HTMLElement>;
};

type BookListResponse = {
    books: Book[];
    currentPage: number;
    totalPages: number;
};

function BookListGrid({ isGrid, scrollContainerRef }: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextPage, setNextPage] = useState(1);
    const [loadedTotalPages, setLoadedTotalPages] = useState(1);
    const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
    const requestIdRef = useRef(0);
    const isFetchingMoreRef = useRef(false);
    const { options, toQueryParams, refreshBooks, bookDisplayMode } = useOptions();
    const { setTotalPages, setCurrentPage } = usePageContext();

    useEffect(() => {
        const controller = new AbortController();
        const requestId = ++requestIdRef.current;

        isFetchingMoreRef.current = false;
        setIsInitialLoading(true);
        setIsLoadingMore(false);
        setBookList([]);

        const loadFirstPage = async () => {
            try {
                const pageToLoad =
                    bookDisplayMode === "all" ? 1 : (options.pg_num ?? 1);
                const searchParamString = toQueryParams({
                    ...options,
                    pg_num: pageToLoad,
                });
                const response = await fetch(`/api/get-books/?${searchParamString}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error("Unable to load books.");

                const data: BookListResponse = await response.json();
                if (requestId !== requestIdRef.current) return;

                setBookList(data.books.map(createBook));
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setLoadedTotalPages(data.totalPages);
                setNextPage(data.currentPage + 1);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error(error);
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsInitialLoading(false);
                }
            }
        };

        void loadFirstPage();

        return () => controller.abort();
    }, [bookDisplayMode, refreshBooks]);

    useEffect(() => {
        const sentinel = loadMoreSentinelRef.current;
        const scrollContainer = scrollContainerRef.current;
        const canLoadMore = nextPage <= loadedTotalPages;

        if (
            bookDisplayMode !== "all" ||
            isInitialLoading ||
            !sentinel ||
            !scrollContainer ||
            !canLoadMore
        ) {
            return;
        }

        const requestId = requestIdRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting || isFetchingMoreRef.current) return;

                isFetchingMoreRef.current = true;
                setIsLoadingMore(true);

                const loadNextPage = async () => {
                    try {
                        const searchParamString = toQueryParams({
                            ...options,
                            pg_num: nextPage,
                        });
                        const response = await fetch(
                            `/api/get-books/?${searchParamString}`,
                            {
                                method: "GET",
                                headers: { "Content-Type": "application/json" },
                            },
                        );

                        if (!response.ok) throw new Error("Unable to load more books.");

                        const data: BookListResponse = await response.json();
                        if (requestId !== requestIdRef.current) return;

                        setBookList((currentBooks) => [
                            ...currentBooks,
                            ...data.books.map(createBook),
                        ]);
                        setLoadedTotalPages(data.totalPages);
                        setNextPage(data.currentPage + 1);
                    } catch (error) {
                        if ((error as Error).name !== "AbortError") {
                            console.error(error);
                        }
                    } finally {
                        if (requestId === requestIdRef.current) {
                            isFetchingMoreRef.current = false;
                            setIsLoadingMore(false);
                        }
                    }
                };

                void loadNextPage();
            },
            {
                root: scrollContainer,
                rootMargin: "0px 0px 240px 0px",
            },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [
        bookDisplayMode,
        isInitialLoading,
        loadedTotalPages,
        nextPage,
        options,
        scrollContainerRef,
        toQueryParams,
    ]);

    if (isInitialLoading) {
        return <BookListGridLoader isGrid={isGrid} />;
    } else {
        return bookList.length > 0 ? (
            <div className="flex flex-col w-full gap-10 justify-between">
                <div
                    className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
                >
                    {bookList.map((book) => {
                        return <BookCard isGrid={isGrid} book={book} key={book.id} />;
                    })}
                </div>
                {bookDisplayMode === "all" && (
                    <div
                        ref={loadMoreSentinelRef}
                        className="flex min-h-12 items-center justify-center text-sm text-primary-600 dark:text-primary-300"
                    >
                        {isLoadingMore ? (
                            <span className="flex items-center gap-2" role="status">
                                <LoaderCircle className="animate-spin" size={18} />
                                Loading more books
                            </span>
                        ) : nextPage <= loadedTotalPages ? (
                            <span>Keep scrolling to load more</span>
                        ) : (
                            <span>All matching books are loaded</span>
                        )}
                    </div>
                )}
            </div>
        ) : (
            <div
                className="w-full border border-primary-300 dark:border-primary-700
                    rounded-md p-4 flex gap-3 justify-center items-center"
            >
                <BookXIcon />
                <h2 className="text-2xl">No books found</h2>
            </div>
        );
    }
}

export default BookListGrid;
