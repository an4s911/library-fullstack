import { useState } from 'react';
import { Book } from '../types/book';
import { X, User, Tag, AlertCircle } from 'lucide-react';

interface BookModalProps {
    book: Book;
    onClose: () => void;
    onUpdate: (updatedBook: Book) => void;
    darkMode: boolean;
}

export function BookModal({ book, onClose, onUpdate, darkMode }: BookModalProps) {
    const [borrower, setBorrower] = useState('');

    const handleBorrow = () => {
        if (!borrower.trim()) return;
        onUpdate({
            ...book,
            borrower: borrower.trim(),
            borrowedAt: new Date(),
        });
    };

    const handleReturn = () => {
        onUpdate({
            ...book,
            borrower: undefined,
            borrowedAt: undefined,
        });
    };

    const handleToggleBorrowing = () => {
        if (book.borrower) return; // Prevent disabling if book is borrowed
        onUpdate({
            ...book,
            allowBorrowing: !book.allowBorrowing,
        });
    };

    const modalClasses = darkMode
        ? 'bg-gray-800 text-white'
        : 'bg-white text-gray-800';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${modalClasses} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{book.title}</h2>
                        <button
                            onClick={onClose}
                            className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5" />
                            <span>{book.author}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {book.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className={`px-3 py-1 ${darkMode
                                        ? 'bg-indigo-900 text-indigo-200'
                                        : 'bg-indigo-100 text-indigo-700'
                                        } rounded-full flex items-center gap-1`}
                                >
                                    <Tag className="w-4 h-4" />
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-medium">Borrowing Status</span>
                                <button
                                    onClick={handleToggleBorrowing}
                                    disabled={book.borrower !== undefined}
                                    className={`px-4 py-2 rounded-md transition-colors ${book.borrower
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : book.allowBorrowing
                                            ? `${darkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`
                                            : `${darkMode ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'}`
                                        }`}
                                >
                                    {book.borrower
                                        ? 'Cannot Modify While Borrowed'
                                        : book.allowBorrowing
                                            ? 'Disable Borrowing'
                                            : 'Enable Borrowing'}
                                </button>
                            </div>

                            {book.allowBorrowing && (
                                <div className="mt-4 space-y-4">
                                    {book.borrower ? (
                                        <div className={`${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'} p-4 rounded-lg`}>
                                            <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                                                <AlertCircle className="w-5 h-5" />
                                                <span>
                                                    Currently borrowed by <strong>{book.borrower}</strong>
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleReturn}
                                                className={`mt-2 px-4 py-2 ${darkMode
                                                    ? 'bg-amber-900/50 text-amber-200 hover:bg-amber-900/70'
                                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    } rounded-md transition-colors`}
                                            >
                                                Mark as Returned
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={borrower}
                                                onChange={(e) => setBorrower(e.target.value)}
                                                placeholder="Enter borrower's name"
                                                className={`w-full px-4 py-2 rounded-md ${darkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                                    }`}
                                            />
                                            <button
                                                onClick={handleBorrow}
                                                className={`w-full px-4 py-2 ${darkMode
                                                    ? 'bg-indigo-500 hover:bg-indigo-600'
                                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                                    } text-white rounded-md disabled:opacity-50 transition-colors`}
                                                disabled={!borrower.trim()}
                                            >
                                                Lend Book
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
