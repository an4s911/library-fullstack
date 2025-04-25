import { BookCopyIcon, BookOpenTextIcon, TagIcon, UserRoundIcon } from "lucide-react";
import { Book } from "@/types";
import { useEffect, useRef, useState } from "react";

type BookCardProps = {
    book: Book;
    isGrid: boolean;
};

function BookCard({ book, isGrid }: BookCardProps) {
    const [localGenres, setLocalGenres] = useState<string[]>([]);
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
                tempSpan.textContent = book.genres[i];

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
        return () => window.removeEventListener("resize", calculateVisibleGenres);
    }, [isGrid, book.genres]);

    return (
        <button
            className={`rounded-md w-full flex flex-col p-4 bg-primary-50 dark:bg-primary-700
            shadow-gray-500 dark:shadow-gray-800 gap-3 shadow-md transition-transform ${
                isGrid ? "hover:scale-105" : "hover:scale-[1.02]"
            }`}
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
                <span className="">{book.author?.name}</span>
            </div>
            <div className="genres">
                <ul
                    ref={genreContainerRef}
                    className="flex gap-2 flex-wrap text-xs text-primary-50"
                >
                    {localGenres.map((genre, index) => {
                        return (
                            <li
                                key={index}
                                className="genre-elem text-nowrap bg-primary-400 dark:bg-primary-400
                                max-w-full px-3 py-1 rounded-full flex items-center gap-1"
                            >
                                <TagIcon className="min-w-3 min-h-3 max-w-3 max-h-3" />
                                <span className="truncate max-w-full">{genre}</span>
                            </li>
                        );
                    })}
                    {book.genres.length > localGenres.length && (
                        <li className="bg-primary-400 dark:bg-primary-400 px-3 py-1 rounded-2xl flex items-center gap-1">
                            <span>+{book.genres.length - localGenres.length}</span>
                        </li>
                    )}
                </ul>
            </div>
            {book.borrowerName && (
                <div className="borrower w-max flex items-center gap-2 border-primary-800 bg-purple-900/40 border-[1px] rounded-full px-3 py-1">
                    <BookCopyIcon
                        size={16}
                        className="opacity-75 text-primary dark:text-primary-300"
                    />
                    <span className="text-xs">{book.borrowerName}</span>
                </div>
            )}
        </button>
    );
}

export default BookCard;
