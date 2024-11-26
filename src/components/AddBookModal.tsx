import { useState, FormEvent } from 'react';
import { Book } from '../types/book';
import { X, Plus, Minus } from 'lucide-react';

interface AddBookModalProps {
    onClose: () => void;
    onAdd: (book: Book) => void;
    darkMode: boolean;
}

export function AddBookModal({ onClose, onAdd, darkMode }: AddBookModalProps) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [genre, setGenre] = useState('');
    const [genres, setGenres] = useState<string[]>([]);

    const handleAddGenre = () => {
        if (genre.trim() && !genres.includes(genre.trim())) {
            setGenres([...genres, genre.trim()]);
            setGenre('');
        }
    };

    const handleRemoveGenre = (genreToRemove: string) => {
        setGenres(genres.filter((g) => g !== genreToRemove));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !author.trim() || genres.length === 0) return;

        const newBook: Book = {
            id: crypto.randomUUID(),
            title: title.trim(),
            author: author.trim(),
            genres,
            allowBorrowing: true,
        };

        onAdd(newBook);
        onClose();
    };

    const modalClasses = darkMode
        ? 'bg-gray-800 text-white'
        : 'bg-white text-gray-800';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${modalClasses} rounded-lg shadow-xl max-w-md w-full`}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Add New Book</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                Author
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className={`w-full px-4 py-2 rounded-md ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                                Genres
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className={`flex-1 px-4 py-2 rounded-md ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                        }`}
                                    placeholder="Enter a genre"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddGenre}
                                    className={`px-4 py-2 ${darkMode
                                        ? 'bg-indigo-500 hover:bg-indigo-600'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                        } text-white rounded-md transition-colors`}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {genres.map((g) => (
                                    <span
                                        key={g}
                                        className={`px-3 py-1 ${darkMode
                                            ? 'bg-indigo-900 text-indigo-200'
                                            : 'bg-indigo-100 text-indigo-700'
                                            } rounded-full flex items-center gap-1`}
                                    >
                                        {g}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGenre(g)}
                                            className={darkMode ? 'text-indigo-300 hover:text-indigo-100' : 'text-indigo-700 hover:text-indigo-900'}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 ${darkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'border border-gray-300 hover:bg-gray-50'
                                } rounded-md transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 ${darkMode
                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } text-white rounded-md disabled:opacity-50 transition-colors`}
                            disabled={!title.trim() || !author.trim() || genres.length === 0}
                        >
                            Add Book
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
