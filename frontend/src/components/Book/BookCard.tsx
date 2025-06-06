import {
    BookCopyIcon,
    BookOpenTextIcon,
    CalendarIcon,
    UserRoundIcon,
} from "lucide-react";
import { Book, Genre } from "@/types";
import { useEffect, useRef, useState } from "react";
import { BookModal } from "@/components/Book";
import { Tag } from "@/components/UI";

type BookCardProps = {
    book: Book;
    isGrid: boolean;
};

function BookCard({ book, isGrid }: BookCardProps) {
    const [localGenres, setLocalGenres] = useState<Genre[]>([]);
    const genreContainerRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);

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

                //                 span width  + icon width + gap + ul (parent padding) + some additional
                const genreWidth =
                    tempSpan.offsetWidth + 12.6 + 4 + 15 + (isGrid ? 10 : 0);

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
        return () => window.removeEventListener("resize", calculateVisibleGenres);
    }, [isGrid, book.genres]);

    return (
        <div
            className={`rounded-md w-full flex flex-col p-4 bg-primary-50 dark:bg-primary-700
            shadow-gray-500 dark:shadow-gray-800 gap-3 shadow-md transition-transform ${
                isGrid ? "hover:scale-105" : "hover:scale-[1.02]"
            }`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
            }}
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
                <span className="max-w-full truncate">{book.author?.name}</span>
            </div>
            <div className="date-added flex items-center gap-2">
                <CalendarIcon size={16} />
                <span className="opacity-75 text-xs">{book.getDateAdded()}</span>
            </div>
            <div className="genres">
                <ul
                    ref={genreContainerRef}
                    className="flex gap-2 flex-wrap text-xs text-primary-50"
                >
                    {localGenres.map((genre, index) => {
                        return <Tag key={index} label={genre.name} size={12} as="li" />;
                    })}
                    {book.genres.length > localGenres.length && (
                        <Tag
                            label={`+${book.genres.length - localGenres.length}`}
                            as="li"
                            mini={true}
                        />
                    )}
                </ul>
            </div>
            {book.borrowerName && (
                <div
                    className="borrower w-max flex items-center gap-2 border-secondary-800
                    dark:border-secondary-300 bg-secondary-200/80 dark:bg-secondary-700/80
                    border-[1px] rounded-full px-3 py-1"
                >
                    <BookCopyIcon
                        size={16}
                        className="opacity-75 text-secondary-900 dark:text-secondary-200"
                    />
                    <span className="text-xs">{book.borrowerName}</span>
                </div>
            )}
            {open && (
                <BookModal
                    onClose={() => {
                        setOpen(false);
                    }}
                    book={book}
                />
            )}
        </div>
    );
}

export default BookCard;
