import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { GenericButton, Modal } from "@/components/UI";
import { GenericSelect } from "@/components/UI";
import { useEffect, useRef, useState } from "react";
import { Author, Genre } from "@/types";
import { useOptions } from "@/contexts";
import { getCSRFToken } from "@/utils";

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
    const { triggerRefresh } = useOptions();

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
        }).then((res) => {
            if (res.ok) {
                formElem.reset();
                triggerRefresh("books");
                onClose();
            } else {
                throw new Error(res.statusText);
            }
        });
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
                    genresList.map((g) => g.id).includes(data.genre.id) ||
                        setGenresList((prev) => [...prev, data.genre]);
                    selectedGenreIdsList.includes(data.genre.id) ||
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
            .then((res) => {
                if (res.ok) {
                    triggerRefresh("filters");
                    return res.json();
                } else {
                    throw new Error(res.statusText);
                }
            })
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

    const handleSelectGenere = (id: number) => {
        if (selectedGenreIdsList.includes(id)) {
            setSelectedGenreIdsList((prev) => prev.filter((genreId) => genreId !== id));
        } else {
            setSelectedGenreIdsList((prev) => [...prev, id]);
        }
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
            <div
                className="add-book-modal p-5 bg-primary-50 dark:bg-gray-800 rounded-md flex flex-col
                gap-5 w-[448px] mx-auto ring-1 ring-primary-400"
            >
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
                                    handleSelectGenere(parseInt(e.target.value));
                                }}
                                fullWidth={true}
                            />
                            <GenericButton type="button" onClick={handleAddNewGenre}>
                                <PlusIcon className="w-5 h-5" />
                            </GenericButton>
                        </div>
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
                                        type="button"
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
                        <GenericButton
                            type="button"
                            onClick={handleOnClose}
                            color="dull"
                        >
                            Cancel
                        </GenericButton>
                        <GenericButton type="submit" disabled={!isValid}>
                            Add Book
                        </GenericButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default AddBookModal;
