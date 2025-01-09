import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Modal } from "../UI";
import { useEffect, useRef, useState } from "react";

type AddBookModalProps = {
    onClose: () => void;
};

function AddBookModal({ onClose }: AddBookModalProps) {
    const [genresList, setGenresList] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [genreInputValue, setGenreInputValue] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const handleFormChange = () => {
        setIsValid(formRef.current?.checkValidity() === true && genresList.length > 0);
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

    return (
        <Modal onClose={onClose}>
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
                >
                    <div className="title">
                        <label htmlFor="">Title</label>
                        <input type="text" required />
                    </div>
                    <div className="author">
                        <label htmlFor="">Author</label>
                        <input type="text" required />
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
                                <div className="flex items-center gap-2 rounded-full bg-primary-200 dark:bg-gray-700 px-3 py-1">
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
                    <div className="flex gap-2 self-end mt-2">
                        <button
                            className="hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={onClose}
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
