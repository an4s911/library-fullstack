import { MinusIcon, PlusIcon } from "lucide-react";
import { GenericButton, GenericSelect, Modal } from "@/components/UI";
import React, { useEffect, useMemo, useState } from "react";
import { Author, Book, Genre } from "@/types";
import { useOptions } from "@/contexts";
import { fetchApi, getCSRFToken } from "@/utils";
import { handleEditBook } from "@/utils/book";
import type { EditBookApiResponse } from "@/utils/book/handleEditBook";

type EditBookModalProps = {
    book: Book;
    onClose: (e?: React.MouseEvent | React.KeyboardEvent) => void;
    onSave: (updatedBook: NonNullable<EditBookApiResponse["book"]>) => void;
};

function EditBookModal({ book, onClose, onSave }: EditBookModalProps) {
    const [title, setTitle] = useState(book.title);
    const [selectedAuthorId, setSelectedAuthorId] = useState<number>(
        book.author ? book.author.id : -1,
    );
    const [authorsList, setAuthorsList] = useState<Author[]>(
        book.author ? [book.author] : [],
    );
    const [genresList, setGenresList] = useState<Genre[]>(book.genres || []);
    const [selectedGenreIdsList, setSelectedGenreIdsList] = useState<number[]>(
        book.genres ? book.genres.map((g) => g.id) : [],
    );
    const [allowBorrow, setAllowBorrow] = useState<boolean>(book.allowBorrow);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { triggerRefresh } = useOptions();

    const allGenresMap = useMemo(() => {
        const map = new Map<number, Genre>();
        book.genres?.forEach((g) => map.set(g.id, g));
        genresList.forEach((g) => map.set(g.id, g));
        return map;
    }, [book.genres, genresList]);

    const selectedGenresList = useMemo(() => {
        return selectedGenreIdsList
            .map((id) => allGenresMap.get(id))
            .filter((g): g is Genre => !!g);
    }, [selectedGenreIdsList, allGenresMap]);

    const isDirty = useMemo(() => {
        if (title.trim() !== book.title.trim()) return true;
        const initialAuthorId = book.author ? book.author.id : -1;
        if (selectedAuthorId !== initialAuthorId) return true;
        if (allowBorrow !== book.allowBorrow) return true;

        const initialGenreIds = (book.genres ? book.genres.map((g) => g.id) : []).sort(
            (a, b) => a - b,
        );
        const currentGenreIds = [...selectedGenreIdsList].sort((a, b) => a - b);
        if (initialGenreIds.length !== currentGenreIds.length) return true;
        for (let i = 0; i < initialGenreIds.length; i++) {
            if (initialGenreIds[i] !== currentGenreIds[i]) return true;
        }

        return false;
    }, [title, selectedAuthorId, allowBorrow, selectedGenreIdsList, book]);

    const isValid =
        title.trim().length > 0 &&
        selectedAuthorId !== -1 &&
        selectedGenreIdsList.length > 0;

    const handleOnClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.stopPropagation?.();
        if (isDirty) {
            if (!window.confirm("You will lose all unsaved changes if you close.")) {
                return;
            }
        }
        onClose(e);
    };

    const handleSelectGenre = (id: number) => {
        if (!selectedGenreIdsList.includes(id)) {
            setSelectedGenreIdsList((prev) => [...prev, id]);
        }
    };

    const handleRemoveGenre = (id: number) => {
        setSelectedGenreIdsList((prev) => prev.filter((genreId) => genreId !== id));
    };

    const handleAddNewAuthorGenre = (type: "author" | "genre") => {
        const options = {
            author: {
                promptText: "author name",
                url: "/api/add-author/",
                transformData: (data: { author: Author }) => {
                    setAuthorsList((prev) =>
                        prev.some((a) => a.id === data.author.id)
                            ? prev
                            : [...prev, data.author],
                    );
                    setSelectedAuthorId(data.author.id);
                },
            },
            genre: {
                promptText: "genre",
                url: "/api/add-genre/",
                transformData: (data: { genre: Genre }) => {
                    setGenresList((prev) =>
                        prev.some((g) => g.id === data.genre.id)
                            ? prev
                            : [...prev, data.genre],
                    );
                    setSelectedGenreIdsList((prev) =>
                        prev.includes(data.genre.id) ? prev : [...prev, data.genre.id],
                    );
                },
            },
        };

        const option = options[type];
        const newItem = prompt(`Enter new ${option.promptText}`, "");
        if (newItem === null || newItem.trim() === "") return;

        fetchApi(
            option.url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                credentials: "include",
                body: JSON.stringify({ name: newItem.trim() }),
            },
            {
                okCallback: () => {
                    triggerRefresh("filters");
                },
                dataCallback: option.transformData,
                showToast: true,
            },
        );
    };

    const handleAddNewAuthor = () => {
        handleAddNewAuthorGenre("author");
    };

    const handleAddNewGenre = () => {
        handleAddNewAuthorGenre("genre");
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);

        const payload = {
            title: title.trim(),
            author_id: selectedAuthorId,
            genre_ids: selectedGenreIdsList,
            allowBorrow: allowBorrow,
        };

        handleEditBook({
            bookId: book.id,
            data: payload,
            callback: () => {
                triggerRefresh("books");
            },
            dataCallback: (data) => {
                setIsSubmitting(false);
                if (data.book) {
                    onSave(data.book);
                }
            },
        });
    };

    useEffect(() => {
        fetchApi(
            "/api/get-authors/",
            {},
            {
                dataCallback: (data: { authors?: Author[] }) => {
                    if (data.authors) {
                        setAuthorsList(data.authors);
                    }
                },
            },
        );

        fetchApi(
            "/api/get-genres/",
            {},
            {
                dataCallback: (data: { genres?: Genre[] }) => {
                    if (data.genres) {
                        setGenresList(data.genres);
                    }
                },
            },
        );
    }, []);

    return (
        <Modal onClose={handleOnClose}>
            <div
                className="add-book-modal p-4 md:p-6 bg-primary-50 dark:bg-gray-800 md:rounded-lg w-full md:w-[30rem] h-full md:h-auto overflow-y-auto ring-1 md:ring-primary-400 shadow-xl flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="top w-full flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-50">
                        Edit Book
                    </h2>
                </div>

                <form
                    className="flex flex-col gap-5"
                    onSubmit={handleFormSubmit}
                >
                    <div className="title">
                        <label htmlFor="edit-book-title">Title</label>
                        <input
                            id="edit-book-title"
                            type="text"
                            required
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter book title"
                            className="w-full text-slate-900 dark:text-slate-100"
                        />
                    </div>

                    <div className="author">
                        <label htmlFor="edit-book-author">Author</label>
                        <div className="flex w-full gap-2 justify-stretch">
                            <GenericSelect
                                optionsList={[
                                    {
                                        value: -1,
                                        label: "Select Author",
                                    },
                                ].concat(
                                    authorsList.map((author) => ({
                                        value: author.id,
                                        label: author.name,
                                    })),
                                )}
                                value={selectedAuthorId}
                                onChange={(e) =>
                                    setSelectedAuthorId(parseInt(e.target.value, 10))
                                }
                                name="author"
                                required={true}
                                fullWidth={true}
                            />
                            <GenericButton
                                type="button"
                                onClick={handleAddNewAuthor}
                                color="primary"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </GenericButton>
                        </div>
                    </div>

                    <div className="genres">
                        <label htmlFor="edit-book-genres">Genres</label>
                        <div className="flex w-full gap-2 justify-stretch">
                            <GenericSelect
                                optionsList={[
                                    {
                                        value: -1,
                                        label: "Select Genres to Add",
                                    },
                                ].concat(
                                    genresList
                                        .filter(
                                            (genre) =>
                                                !selectedGenreIdsList.includes(genre.id),
                                        )
                                        .map((genre) => ({
                                            value: genre.id,
                                            label: genre.name,
                                        })),
                                )}
                                value={-1}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (val !== -1) {
                                        handleSelectGenre(val);
                                    }
                                }}
                                fullWidth={true}
                            />
                            <GenericButton
                                type="button"
                                onClick={handleAddNewGenre}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </GenericButton>
                        </div>
                    </div>

                    {selectedGenresList.length > 0 && (
                        <div className="added-genres-list flex !flex-row flex-wrap gap-2">
                            {selectedGenresList.map((genre) => (
                                <div
                                    key={genre.id}
                                    className="flex items-center gap-2 rounded-full bg-primary-200 dark:bg-gray-700 px-3 py-1 text-slate-800 dark:text-slate-200 text-sm"
                                >
                                    <span>{genre.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveGenre(genre.id);
                                        }}
                                        className="hover:text-error-600 dark:hover:text-error-400"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="allow-borrow">
                        <label htmlFor="edit-book-allow-borrow">Allow Borrow</label>
                        <div className="flex items-center gap-2 self-start">
                            <input
                                id="edit-book-allow-borrow"
                                type="checkbox"
                                className="h-6 w-6 cursor-pointer"
                                checked={allowBorrow}
                                onChange={(e) => setAllowBorrow(e.target.checked)}
                                name="allowBorrow"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 self-end mt-2">
                        <GenericButton
                            type="button"
                            onClick={handleOnClose}
                            color="dull"
                        >
                            Cancel
                        </GenericButton>
                        <GenericButton
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </GenericButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default EditBookModal;
