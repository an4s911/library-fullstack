import {
    FileTextIcon,
    FolderUpIcon,
    InfoIcon,
    MinusIcon,
    PlusIcon,
    XIcon,
} from "lucide-react";
import { GenericButton, Modal } from "@/components/UI";
import { GenericSelect } from "@/components/UI";
import { useEffect, useRef, useState } from "react";
import { Author, Genre } from "@/types";
import { useOptions } from "@/contexts";
import { fetchApi, getCSRFToken } from "@/utils";

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
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOnClose = () => {
        // Check if there is any unsaved changes
        // If there are unsaved changes, prompt the user

        const title = (
            formElemRef.current!.elements.namedItem("title") as HTMLInputElement
        ).value;
        if (
            title !== "" ||
            selectedAuthorId !== -1 ||
            selectedGenreIdsList.length > 0 ||
            file
        ) {
            if (!window.confirm("You will lose all unsaved changes if you close.")) {
                return;
            }

            onClose();
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

        fetchApi(
            "/api/add-book/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                credentials: "include",
                body: JSON.stringify(newBook),
            },
            {
                okCallback: () => {
                    formElem.reset();
                    triggerRefresh("books");
                    onClose();
                },
                showToast: true,
            },
        );
    };

    const handleAddNewAuthorGenre = (type: string) => {
        const options: any = {
            author: {
                promptText: "author name",
                url: "/api/add-author/",
                transformData: (data: any) => {
                    authorsList.map((a) => a.id).includes(data.author.id) ||
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

        fetchApi(
            option.url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                credentials: "include",
                body: JSON.stringify({ name: newItem }),
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
            fetchApi(
                options[option].url,
                {},
                {
                    dataCallback: (data) => {
                        if (data[options[option].itemsKey]) {
                            options[option].setList(data[options[option].itemsKey]);
                        }
                    },
                },
            );
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

    function handleDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragLeave(e: any) {
        e.preventDefault();
        e.stopPropagation();

        // Check if the mouse actually left the container
        const currentTarget = e.currentTarget;
        const relatedTarget = e.relatedTarget as Node | null;

        if (!currentTarget.contains(relatedTarget)) {
            setIsDragging(false);
        }
    }

    function handleDragOver(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e: any) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            fileInputRef.current!.files = e.dataTransfer.files;
            setFile(file);
        }
    }

    return (
        <Modal onClose={handleOnClose}>
            <div
                className="add-book-modal p-5 bg-primary-50 dark:bg-gray-800 rounded-md w-max ring-1
                ring-primary-400 flex gap-5"
            >
                <div className="flex items-center gap-16 px-10">
                    <div className="flex flex-col gap-5 items-start">
                        <div
                            className="w-max max-w-full flex border-[1px] border-info-500
                            rounded-md p-3 bg-info-100 dark:bg-info-900 gap-2 items-center"
                        >
                            <InfoIcon size={22} className="text-info-500" />
                            <div className="flex flex-col gap-1">
                                <span className="text-base">CSV Format</span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    title,author,genres,allowBorrow
                                </span>
                            </div>
                        </div>

                        <form
                            className="flex flex-col gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData();
                                formData.append("file", file!);

                                fetchApi(
                                    "/api/add-books/",
                                    {
                                        method: "POST",
                                        headers: {
                                            "X-CSRFToken": getCSRFToken(),
                                        },
                                        credentials: "include",
                                        body: formData,
                                    },
                                    {
                                        okCallback: () => {
                                            triggerRefresh();
                                            setFile(null);
                                            onClose();
                                        },
                                        showToast: true,
                                    },
                                );
                            }}
                            onChange={(e) => {
                                e.preventDefault();
                                const elem = e.target as HTMLInputElement;
                                if (elem.files && elem.files.length > 0) {
                                    const file = elem.files[0];
                                    setFile(file);
                                }
                            }}
                        >
                            <div>
                                <label
                                    htmlFor="upload-books-file-csv-input"
                                    className={`flex flex-col items-center cursor-pointer rounded-md justify-between
                                    border-dashed py-10 border-2 border-primary-300 dark:border-primary-600 px-5
                                    hover:border-primary-600 dark:hover:border-primary-400 transition-colors h-56 w-64
                                    ${isDragging ? "bg-gray-400 border-primary-600 dark:bg-gray-700" : ""}
                                    `}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                >
                                    <FolderUpIcon />
                                    {file ? (
                                        <div
                                            className="text-base font-normal italic self-center
                                            flex flex-col items-center justify-center gap-3 rounded-md
                                            border-2 p-3 border-secondary-400 bg-secondary-200
                                            dark:border-secondary-300 dark:bg-secondary-600
                                            max-w-full"
                                        >
                                            <FileTextIcon size={30} />
                                            <div className="max-w-full flex">
                                                <span className="w-full truncate">
                                                    {file.name.split(".")[0]}
                                                </span>
                                                <span className="">
                                                    .{file.name.split(".")[1]}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 items-center">
                                            <span className="text-base font-normal">
                                                Click to browse files
                                            </span>
                                            <span className="text-base font-normal">
                                                OR
                                            </span>
                                            <span className="text-base font-normal">
                                                Drag & drop
                                            </span>
                                        </div>
                                    )}
                                </label>
                                <input
                                    ref={fileInputRef}
                                    id="upload-books-file-csv-input"
                                    type="file"
                                    hidden
                                />
                            </div>
                            <GenericButton type="submit">Upload</GenericButton>
                        </form>
                    </div>
                    <div className="w-[0.5px] h-full bg-slate-400/40"></div>
                </div>
                <div className="flex flex-col gap-5 w-[448px]">
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
                                        className="flex items-center gap-2 rounded-full bg-primary-200 dark:bg-gray-700 px-3 py-1"
                                    >
                                        <span>{genre.name}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedGenreIdsList((prev) =>
                                                    prev.filter(
                                                        (id) => id !== genre.id,
                                                    ),
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
            </div>
        </Modal>
    );
}

export default AddBookModal;
