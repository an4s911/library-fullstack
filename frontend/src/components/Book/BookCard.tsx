import {
    BookOpenTextIcon,
    CalendarIcon,
    TagIcon,
    UserRoundIcon,
} from "lucide-react";
import { Book, Genre } from "../../types/book";
import { useEffect, useState } from "react";

type BookCardProps = {
    book: Book;
};

function BookCard({ book }: BookCardProps) {
    const [localGenres, setLocalGenres] = useState<Genre[]>([]);

    useEffect(() => {
        setLocalGenres(book.genres.slice(0, 3));
    }, []);

    return (
        <div
            className="rounded-md w-full flex flex-col p-4 bg-primary-50 dark:bg-primary-700
            shadow-gray-500 dark:shadow-gray-800 gap-3 shadow-md transition-transform hover:scale-105
            cursor-pointer"
        >
            <div className="top flex items-center gap-2">
                <BookOpenTextIcon
                    size={28}
                    className="text-primary dark:text-primary-300"
                />
                <h3 className="text-xl font-bold">{book.title}</h3>
            </div>
            <div className="author flex items-center gap-2">
                <UserRoundIcon
                    size={18}
                    className="opacity-75 text-primary dark:text-primary-300"
                />
                <span className="">{book.author}</span>
            </div>
            <div className="date-added flex items-center gap-2 opacity-75">
                <CalendarIcon size={14} className="opacity-75" />
                <span>{book.dateAdded.toDateString()}</span>
            </div>
            <div className="genres">
                <ul className="flex gap-2 flex-wrap text-xs text-primary-50">
                    {localGenres.map((genre) => {
                        return (
                            <li
                                key={genre.id}
                                className="bg-primary-400 dark:bg-primary-400 px-3 py-1 rounded-2xl flex items-center gap-1"
                            >
                                <TagIcon size={12} />
                                <span>{genre.name}</span>
                            </li>
                        );
                    })}
                    {book.genres.length > 3 && (
                        <li className="bg-primary-400 dark:bg-primary-400 px-3 py-1 rounded-2xl flex items-center gap-1">
                            <span>+{book.genres.length - 3}</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default BookCard;
