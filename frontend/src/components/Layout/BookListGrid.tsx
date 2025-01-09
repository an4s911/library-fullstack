import { useEffect, useState } from "react";
import { BookCard } from "../Book";
import { BookListGridLoader } from "../SkeletonLoaders";
import { Book } from "../../types/book";

type BookListGridProps = {
    isLoading: boolean;
    onStartLoading: () => void;
    onStopLoading: () => void;
    isGrid: boolean;
};

function BookListGrid({
    isLoading,
    onStartLoading,
    onStopLoading,
    isGrid,
}: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);

    useEffect(() => {
        onStartLoading();
        fetch("/api/get-books/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setBookList(data.books);
                onStopLoading();
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    if (isLoading) {
        return <BookListGridLoader />;
    } else {
        return (
            <div
                className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
            >
                {bookList.map((book) => {
                    return <BookCard isGrid={isGrid} book={book} key={book.id} />;
                })}
            </div>
        );
    }
}

export default BookListGrid;
