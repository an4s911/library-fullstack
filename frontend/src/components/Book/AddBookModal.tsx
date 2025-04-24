import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { DropdownOption, Modal, SimpleDropdown } from "../UI";
import { useEffect, useRef, useState } from "react";
import { Book } from "../../types/book";
import { Author } from "../../types/author";

type AddBookModalProps = {
    onClose: () => void;
};

function AddBookModal({ onClose }: AddBookModalProps) {
    const [genresList, setGenresList] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [genreInputValue, setGenreInputValue] = useState("");
    const [newBook, setNewBook] = useState<Book>({
        title: "",
        author: null,
        allowBorrow: false,
        genres: [],
    });
    const [authorOptions, setAuthorOptions] = useState<DropdownOption[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const allowBorrowCheckboxRef = useRef<HTMLInputElement>(null);

    const handleOnClose = () => {
        // Check if there is any unsaved changes
        // If there are unsaved changes, prompt the user
        if (
            newBook.title !== "" ||
            newBook.author !== null ||
            genresList.length !== 0 ||
            allowBorrowCheckboxRef.current?.checked !==
                allowBorrowCheckboxRef.current?.defaultChecked
        ) {
            window.confirm("You will lose all unsaved changes if you close.") &&
                window.confirm("Are you really sure?") &&
                window.confirm("Are you a 100% sure?");

            if (!window.confirm("Are you REALLY REALLY sure?")) {
                return; // Thats so fun!!
            } else {
                onClose();
            }
        }
    };

    const handleFormChange = () => {
        setIsValid(formRef.current?.checkValidity() === true && genresList.length > 0);

        const formData = new FormData(formRef.current!);
        setNewBook((prev) => {
            return {
                ...prev,
                title: formData.get("title") as string,
                allowBorrow: allowBorrowCheckboxRef.current?.checked || false,
                genres: genresList,
            };
        });
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetch("/api/add-book/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newBook),
        }).then((res) => {
            if (res.ok) {
                onClose();
            }
        });
    };

    const handleAddNewGenre = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        const newGenre = genreInputValue.trim();

        if (genresList.includes(newGenre)) {
            return;
        } else if (newGenre === "") {
            setGenreInputValue("");
            return;
        } else {
            setGenresList([...genresList, newGenre]);
            setGenreInputValue("");
        }
    };

    useEffect(() => {
        handleFormChange();
    }, [genresList]);

    useEffect(() => {
        //  Fetch authors and set author options
        fetch("/api/get-authors/")
            .then((res) => res.json())
            .then((data) => {
                setAuthors(data.authors);
                setAuthorOptions(
                    data.authors.map((author: Author) => ({
                        value: author.id,
                        label: author.name,
                    })),
                );
            });
    }, []);

    useEffect(() => {
        setAuthorOptions(
            authors.map((author: Author) => ({
                value: author.id,
                label: author.name,
            })),
        );
    }, [authors]);

    return (
        <Modal onClose={handleOnClose}>
            <div className="add-book-modal p-5 bg-primary-50 dark:bg-gray-800 rounded-md flex flex-col gap-5 w-[448px]">
                <div className="top w-full flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Add New Book</h2>
                    <button className="opacity-65 hover:opacity-100" onClick={onClose}>
                        <XIcon />
                    </button>
                </div>
                <form
                    ref={formRef}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    action=""
                    className="flex flex-col gap-5"
                    onChange={handleFormChange}
                    onSubmit={handleFormSubmit}
                >
                    <div className="title">
                        <label htmlFor="">Title</label>
                        <input type="text" required name="title" />
                    </div>
                    <div className="author">
                        <SimpleDropdown
                            label="Author"
                            inputName="author"
                            options={authorOptions}
                            onAddOption={(newAuthorName: string) => {
                                fetch("/api/add-author/", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ name: newAuthorName }),
                                })
                                    .then((res) => res.json())
                                    .then((data) => {
                                        const newAuthor: Author = data.author;

                                        setAuthors((prev) => [...prev, newAuthor]);
                                    });

                                return newAuthorName;
                            }}
                            onSelect={(selectedOption) => {
                                if (selectedOption) {
                                    setNewBook((prev) => {
                                        return {
                                            ...prev,
                                            author: selectedOption.value as number,
                                        };
                                    });
                                }
                            }}
                        />
                    </div>
                    <div className="genres">
                        <label htmlFor="">Genres</label>
                        <div className="flex w-full gap-2">
                            <input
                                type="text"
                                className="w-full"
                                placeholder="Enter a genre"
                                value={genreInputValue}
                                onChange={(e) => setGenreInputValue(e.target.value)}
                            />
                            <button
                                onClick={handleAddNewGenre}
                                className="flex items-center justify-center px-4 text-primary-50 bg-primary hover:bg-primary-500
                                dark:bg-primary hover:dark:bg-primary-600 rounded-md h-auto transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {genresList.length > 0 && (
                        <div className="added-genres-list flex !flex-row flex-wrap gap-2">
                            {genresList.map((genre) => (
                                <div
                                    key={genre}
                                    className="flex items-center gap-2 rounded-full bg-primary-200 dark:bg-gray-700 px-3 py-1"
                                >
                                    <span>{genre}</span>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setGenresList(
                                                genresList.filter((g) => g !== genre),
                                            );
                                        }}
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="allow-borrow">
                        <label htmlFor="">Allow Borrow</label>
                        <div className="flex self-start">
                            <>
                                <input
                                    ref={allowBorrowCheckboxRef}
                                    type="checkbox"
                                    className="h-6 w-6"
                                    defaultChecked
                                />
                            </>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end mt-2">
                        <button
                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={handleOnClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-primary-50 disabled:opacity-65 transition-colors
                            bg-primary hover:bg-primary-500 disabled:hover:bg-primary
                            dark:bg-primary dark:hover:bg-primary-600 disabled:dark:hover:bg-primary"
                            disabled={!isValid}
                        >
                            Add Book
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default AddBookModal;
