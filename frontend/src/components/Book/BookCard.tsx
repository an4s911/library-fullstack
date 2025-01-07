import {
    BookOpenTextIcon,
    CalendarIcon,
    TagIcon,
    UserRoundIcon,
} from "lucide-react";
import { Book, Genre } from "../../types/book";
import { useEffect, useRef, useState } from "react";

type BookCardProps = {
    book: Book;
};

function BookCard({ book }: BookCardProps) {
    const [localGenres, setLocalGenres] = useState<Genre[]>([]);
    const genreContainerRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const calculateVisibleGenres = () => {
            if (!genreContainerRef.current) return;

            const container = genreContainerRef.current;
            const containerWidth = container.offsetWidth;

            let totalWidth = 0;
            let visibleCount = 0;

            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.className = "px-3 py-1 rounded-full text-xs";
            document.body.appendChild(tempSpan);

            // Measure each genre
            for (let i = 0; i < book.genres.length; i++) {
                tempSpan.textContent = book.genres[i].name;

                //                 span width  + icon width + gap + ul (parent padding)
                const genreWidth = tempSpan.offsetWidth + 12 + 4 + 12;

                if (totalWidth + genreWidth <= containerWidth) {
                    totalWidth += genreWidth;
                    visibleCount++;
                } else {
                    break;
                }
            }

            document.body.removeChild(tempSpan);

            setLocalGenres(book.genres.slice(0, visibleCount));
        };

        calculateVisibleGenres();
        window.addEventListener("resize", calculateVisibleGenres);
        return () =>
            window.removeEventListener("resize", calculateVisibleGenres);
    }, []);

    return (
        <div
            className="rounded-md w-full flex flex-col p-4 bg-primary-50 dark:bg-primary-700
            shadow-gray-500 dark:shadow-gray-800 gap-3 shadow-md transition-transform hover:scale-105
            cursor-pointer"
        >
            <div className="top flex items-center gap-2 max-w-max">
                <BookOpenTextIcon
                    size={28}
                    className="text-primary dark:text-primary-300"
                />
                <h3 className="text-xl font-bold truncate text-ellipsis w-full">
                    {book.title}
                </h3>
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
                <ul
                    ref={genreContainerRef}
                    className="flex gap-2 flex-wrap text-xs text-primary-50"
                >
                    {localGenres.map((genre) => {
                        return (
                            <li
                                key={genre.id}
                                // text no allowed to wrap but allowed to truncate
                                className="genre-elem text-nowrap bg-primary-400 dark:bg-primary-400
                                max-w-full px-3 py-1 rounded-full flex items-center gap-1"
                            >
                                <TagIcon className="min-w-3 min-h-3 max-w-3 max-h-3" />
                                <span className="truncate max-w-full">
                                    {genre.name}
                                </span>
                            </li>
                        );
                    })}
                    {book.genres.length > localGenres.length && (
                        <li className="bg-primary-400 dark:bg-primary-400 px-3 py-1 rounded-2xl flex items-center gap-1">
                            <span>
                                +{book.genres.length - localGenres.length}
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default BookCard;
