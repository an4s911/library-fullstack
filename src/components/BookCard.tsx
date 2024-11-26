import { useRef, useEffect, useState } from 'react';
import { Book } from '../types/book';
import { BookOpen, User, Tag } from 'lucide-react';

interface BookCardProps {
    book: Book;
    onBookClick: (book: Book) => void;
    viewMode: 'grid' | 'list';
    darkMode: boolean;
}

export function BookCard({ book, onBookClick, viewMode, darkMode }: BookCardProps) {
    const [visibleGenres, setVisibleGenres] = useState<string[]>([]);
    const genresContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateVisibleGenres = () => {
            if (!genresContainerRef.current) return;

            const container = genresContainerRef.current;
            const containerWidth = container.offsetWidth;
            let totalWidth = 0;
            let visibleCount = 0;

            // Create a temporary span to measure text width
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.className = 'px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1';
            document.body.appendChild(tempSpan);

            // Measure each genre
            for (let i = 0; i < book.genres.length; i++) {
                tempSpan.textContent = book.genres[i];
                const genreWidth = tempSpan.offsetWidth + 8; // Add margin

                if (totalWidth + genreWidth <= containerWidth) {
                    totalWidth += genreWidth;
                    visibleCount++;
                } else {
                    break;
                }
            }

            document.body.removeChild(tempSpan);

            // Show at least 3 genres if there are 3 or more
            visibleCount = Math.max(visibleCount, Math.min(3, book.genres.length));
            setVisibleGenres(book.genres.slice(0, visibleCount));
        };

        calculateVisibleGenres();
        window.addEventListener('resize', calculateVisibleGenres);
        return () => window.removeEventListener('resize', calculateVisibleGenres);
    }, [book.genres, viewMode]);

    const cardClasses = viewMode === 'grid'
        ? `${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 transition-all duration-200`
        : `${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-4 transition-all duration-200 flex items-center gap-4`;

    return (
        <div
            className={cardClasses}
            onClick={() => onBookClick(book)}
            role="button"
            tabIndex={0}
        >
            <div className={viewMode === 'grid' ? 'space-y-4' : 'flex-1 flex items-center gap-6'}>
                <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                        <BookOpen className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                        {book.title}
                    </h3>

                    <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <User className="w-4 h-4" />
                        <span>{book.author}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2" ref={genresContainerRef}>
                        {visibleGenres.map((genre) => (
                            <span
                                key={genre}
                                className={`px-2 py-1 ${darkMode
                                    ? 'bg-indigo-900 text-indigo-200'
                                    : 'bg-indigo-100 text-indigo-700'
                                    } rounded-full text-sm flex items-center gap-1`}
                            >
                                <Tag className="w-3 h-3" />
                                {genre}
                            </span>
                        ))}
                        {visibleGenres.length < book.genres.length && (
                            <span className={`px-2 py-1 ${darkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                                } rounded-full text-sm`}>
                                +{book.genres.length - visibleGenres.length}
                            </span>
                        )}
                    </div>
                </div>

                {book.borrower && (
                    <div className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex items-center gap-1 mt-2`}>
                        <User className="w-4 h-4" />
                        <span>Borrowed by {book.borrower}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
