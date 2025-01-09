import { useEffect, useState } from "react";
import { BookCard } from "../Book";
import { BookListGridLoader } from "../SkeletonLoaders";
import { Book } from "../../types/book";
import { BookIcon } from "lucide-react";

type BookListGridProps = {
    isGrid: boolean;
};

function BookListGrid({ isGrid }: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
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
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    if (isLoading) {
        return <BookListGridLoader />;
    } else {
        return bookList.length > 0 ? (
            <div
                className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
            >
                {bookList.map((book) => {
                    return <BookCard isGrid={isGrid} book={book} key={book.id} />;
                })}
            </div>
        ) : (
            <div
                className="w-full border border-primary-300 dark:border-primary-700
                    rounded-md p-4 flex gap-3 justify-center items-center"
            >
                <BookIcon />
                <h2 className="text-2xl">No books found</h2>
            </div>
        );
    }
}

export default BookListGrid;
