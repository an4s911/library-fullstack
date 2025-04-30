import { useEffect, useState } from "react";
import { BookCard } from "@/components/Book";
import { BookListGridLoader } from "@/components/SkeletonLoaders";
import { Book, createBook } from "@/types";
import { BookXIcon } from "lucide-react";
import { useOptions, usePageContext } from "@/contexts";

type BookListGridProps = {
    isGrid: boolean;
};

function BookListGrid({ isGrid }: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { options, toQueryParams, refreshBooks } = useOptions();
    const { setTotalPages, setCurrentPage } = usePageContext();

    useEffect(() => {
        setIsLoading(true);

        const searchParamString = toQueryParams(options);

        fetch(`/api/get-books/?${searchParamString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error(res.statusText);
                }
            })
            .then((data) => {
                setBookList(
                    data.books.map((book: Book) => {
                        return createBook(book);
                    }),
                );
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [refreshBooks]);

    if (isLoading) {
        return <BookListGridLoader isGrid={isGrid} />;
    } else {
        return bookList.length > 0 ? (
            <div className="flex flex-col w-full gap-10 justify-between">
                <div
                    className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
                >
                    {bookList.map((book) => {
                        return <BookCard isGrid={isGrid} book={book} key={book.id} />;
                    })}
                </div>
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
