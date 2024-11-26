import { useState, useEffect } from 'react';
import { Book, ViewMode } from './types/book';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { AddBookModal } from './components/AddBookModal';
import { LayoutGrid, List, Plus, Library, Sun, Moon } from 'lucide-react';


function App() {
    const [books, setBooks] = useState<Book[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const handleBookUpdate = (updatedBook: Book) => {
        setBooks(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
        setSelectedBook(updatedBook); // Update the selected book state to reflect changes immediately
    };

    const handleAddBook = (newBook: Book) => {
        setBooks([...books, newBook]);
    };

    // Toggle dark mode and update document class
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Set books on initial render
    useEffect(() => {
        // Sample initial data
        const initialBooks: Book[] = [
            {
                id: '1',
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                genres: ['Classic', 'Fiction', 'Romance', 'Drama'],
                allowBorrowing: true,
            },
            {
                id: '2',
                title: '1984',
                author: 'George Orwell',
                genres: ['Science Fiction', 'Dystopian', 'Political Fiction'],
                allowBorrowing: true,
            },
        ];

        setBooks(initialBooks);
    }, []);

    return (
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
            <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Library className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Library</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <div className={`flex items-center rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md ${viewMode === 'grid'
                                        ? `${darkMode ? 'bg-gray-600 text-indigo-400' : 'bg-white shadow-sm text-indigo-600'}`
                                        : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`
                                        }`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md ${viewMode === 'list'
                                        ? `${darkMode ? 'bg-gray-600 text-indigo-400' : 'bg-white shadow-sm text-indigo-600'}`
                                        : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`
                                        }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className={`flex items-center gap-2 px-4 py-2 ${darkMode
                                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    } rounded-lg transition-colors duration-200`}
                            >
                                <Plus className="w-5 h-5" />
                                Add Book
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                    }
                >
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            viewMode={viewMode}
                            onBookClick={setSelectedBook}
                            darkMode={darkMode}
                        />
                    ))}
                </div>

                {selectedBook && (
                    <BookModal
                        book={selectedBook}
                        onClose={() => setSelectedBook(null)}
                        onUpdate={handleBookUpdate}
                        darkMode={darkMode}
                    />
                )}

                {showAddModal && (
                    <AddBookModal
                        onClose={() => setShowAddModal(false)}
                        onAdd={handleAddBook}
                        darkMode={darkMode}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
