import { useEffect, useState } from "react";
import { BookCard } from "../Book";
import { BookListGridLoader } from "../SkeletonLoaders";
import { Book } from "../../types/book";

type BookListGridProps = {
    isLoading: boolean;
    isGrid: boolean;
};

function BookListGrid({ isLoading, isGrid }: BookListGridProps) {
    const [bookList, setBookList] = useState<Book[]>([]);

    useEffect(() => {
        setBookList([
            {
                id: 1,
                title: "The Alchemist",
                author: "Paulo Coelho",
                dateAdded: new Date("2024-11-24"),
                genres: [
                    {
                        id: 1,
                        name: "Fiction",
                    },
                    {
                        id: 2,
                        name: "Adventure",
                    },
                    {
                        id: 3,
                        name: "Fantasy",
                    },
                ],
            },
            {
                id: 2,
                title: "Silent Patient",
                author: "Alex Michaelides",
                dateAdded: new Date("2024-12-05"),
                genres: [
                    {
                        id: 1,
                        name: "Suspense",
                    },
                    {
                        id: 2,
                        name: "Thriller",
                    },
                    {
                        id: 3,
                        name: "Mystery",
                    },
                    {
                        id: 4,
                        name: "Psychological Thriller",
                    },
                    {
                        id: 5,
                        name: "Horror",
                    },
                    {
                        id: 6,
                        name: "Horror",
                    },
                ],
            },
        ]);
    }, []);

    if (isLoading) {
        return <BookListGridLoader />;
    } else {
        return (
            <div
                className={`book-list-grid gap-5 ${isGrid ? "grid grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}
            >
                {bookList.map((book) => {
                    return (
                        <BookCard isGrid={isGrid} book={book} key={book.id} />
                    );
                })}
            </div>
        );
    }
}

export default BookListGrid;
