import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Modal } from "@/components/UI";
import { GenericSelect } from "@/components/UI";
import { useEffect, useRef, useState } from "react";
import { Author, Genre } from "@/types";

type AddBookModalProps = {
    onClose: () => void;
};

function AddBookModal({ onClose }: AddBookModalProps) {
    const [isValid, setIsValid] = useState(false);
    const [selectedAuthorId, setSelectedAuthorId] = useState<number>(-1);
    const [authorsList, setAuthorsList] = useState<Author[]>([]);
    const [genresList, setGenresList] = useState<Genre[]>([]);
    const [selectedGenresList, setSelectedGenresList] = useState<Genre[]>([]);
    const [selectedGenreIdsList, setSelectedGenreIdsList] = useState<number[]>([]);
    const formElemRef = useRef<HTMLFormElement>(null);

    const handleOnClose = () => {
        // Check if there is any unsaved changes
        // If there are unsaved changes, prompt the user

        const title = (
            formElemRef.current!.elements.namedItem("title") as HTMLInputElement
        ).value;
        if (
            title !== "" ||
            selectedAuthorId !== -1 ||
            selectedGenreIdsList.length > 0
        ) {
            if (
                window.confirm("You will lose all unsaved changes if you close.") &&
                window.confirm("Are you really sure?") &&
                window.confirm("Are you a 100% sure?")
            )
                if (!window.confirm("Are you REALLY REALLY sure?")) {
                    return; // Thats so fun!!
                } else {
                    onClose();
                }
            else return;
        } else {
            onClose();
        }
    };

    const handleFormChange = () => {
        const formElem = formElemRef.current!;

        setIsValid(formElem.checkValidity() && selectedGenreIdsList.length > 0);
    };

    const getCSRFToken = () => {
        const cookie = document.cookie;

        if (!cookie) return "";

        const csrftokenCookie = cookie
            .split(";")
            .find((cookie) => cookie.trim().startsWith("csrftoken="))!;

        return csrftokenCookie.split("=")[1];
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isValid) return;

        const formElem = formElemRef.current!;
        const formData = new FormData(formElem);

        formData.set("allowBorrow", formElem.allowBorrow.checked);

        const newBook: any = Object.fromEntries(formData);
        newBook["genres"] = selectedGenreIdsList;

        fetch("/api/add-book/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify(newBook),
        })
            .then((res) => res.json())
            .then((data) => console.log(data));
    };

    const handleAddNewAuthorGenre = (type: string) => {
        const options: any = {
            author: {
                promptText: "author name",
                url: "/api/add-author/",
                transformData: (data: any) => {
                    setAuthorsList((prev) => [...prev, data.author]);
                    setSelectedAuthorId(data.author.id);
                },
            },
            genre: {
                promptText: "genre",
                url: "/api/add-genre/",
                transformData: (data: any) => {
                    setGenresList((prev) => [...prev, data.genre]);
                    setSelectedGenreIdsList((prev) => [...prev, data.genre.id]);
                },
            },
        };

        const option = options[type];

        const newItem = prompt(`Enter new ${option.promptText}`, "");

        if (newItem === null || newItem === "") return;

        fetch(option.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify({ name: newItem }),
        })
            .then((res) => res.json())
            .then((data) => {
                option.transformData(data);
            })
            .catch((err) => console.log(err));
    };

    const handleAddNewAuthor = () => {
        handleAddNewAuthorGenre("author");
    };

    const handleAddNewGenre = () => {
        handleAddNewAuthorGenre("genre");
    };

    useEffect(() => {
        const options: any = {
            author: {
                url: "/api/get-authors/",
                setList: setAuthorsList,
                itemsKey: "authors",
            },
            genre: {
                url: "/api/get-genres/",
                setList: setGenresList,
                itemsKey: "genres",
            },
        };

        for (const option in options) {
            fetch(options[option].url)
                .then((res) => res.json())
                .then((data) => options[option].setList(data[options[option].itemsKey]))
                .catch((err) => console.log(err));
        }
    }, []);

    useEffect(() => {
        setSelectedGenresList(
            genresList.filter((genre) => selectedGenreIdsList.includes(genre.id)),
        );
    }, [selectedGenreIdsList]);

    useEffect(() => {
        handleFormChange();
    }, [selectedGenreIdsList, selectedAuthorId]);

    return (
        <Modal onClose={handleOnClose}>
            <div className="add-book-modal p-5 bg-primary-50 dark:bg-gray-800 rounded-md flex flex-col gap-5 w-[448px]">
                <div className="top w-full flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Add New Book</h2>
                    <button
                        className="opacity-65 hover:opacity-100"
                        onClick={handleOnClose}
                    >
                        <XIcon />
                    </button>
                </div>
                <form
                    ref={formElemRef}
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
                        <label htmlFor="">Author</label>
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
                                    setSelectedAuthorId(parseInt(e.target.value))
                                }
                                name="author"
                                required={true}
                                fullWidth={true}
                            />
                            <button
                                onClick={handleAddNewAuthor}
                                className="flex items-center justify-center px-4 text-primary-50 bg-primary hover:bg-primary-500
                                dark:bg-primary hover:dark:bg-primary-600 rounded-md h-auto transition-colors flex-shrink"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="genres">
                        <label htmlFor="">Genres</label>
                        <div className="flex w-full gap-2 justify-stretch">
                            <GenericSelect
                                optionsList={[
                                    {
                                        value: -1,
                                        label: "Select Genres to Add",
                                    },
                                ].concat(
                                    genresList.map((genre) => ({
                                        value: genre.id,
                                        label: genre.name,
                                    })),
                                )}
                                value={-1}
                                onChange={(e) => {
                                    setSelectedGenreIdsList((prev) => {
                                        if (prev.includes(parseInt(e.target.value))) {
                                            return prev.filter(
                                                (id) => id !== parseInt(e.target.value),
                                            );
                                        }
                                        return [...prev, parseInt(e.target.value)];
                                    });
                                }}
                                fullWidth={true}
                            />
                            <button
                                onClick={handleAddNewGenre}
                                className="flex items-center justify-center px-4 text-primary-50 bg-primary hover:bg-primary-500
                                dark:bg-primary hover:dark:bg-primary-600 rounded-md h-auto transition-colors flex-shrink"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/* <input */}
                        {/*     name="genres" */}
                        {/*     required */}
                        {/*     type="hidden" */}
                        {/*     value={selectedGenreIdsList.map((id) => id.toString())} */}
                        {/*     readOnly */}
                        {/* /> */}
                    </div>
                    {selectedGenresList.length > 0 && (
                        <div className="added-genres-list flex !flex-row flex-wrap gap-2">
                            {selectedGenresList.map((genre) => (
                                <div
                                    key={genre.id}
                                    className="flex items-center gap-2 rounded-full bg-primary-200 dark:bg-gray-700 px-3 py-1"
                                >
                                    <span>{genre.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedGenreIdsList((prev) =>
                                                prev.filter((id) => id !== genre.id),
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
                                    type="checkbox"
                                    className="h-6 w-6"
                                    defaultChecked
                                    name="allowBorrow"
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
