import { Book } from "@/types";
import { fetchApi, getCSRFToken } from "@/utils";

type handleDeleteBookProps = {
    book: Book;
    callback: () => void;
};

const handleDeleteBook = async ({ book, callback }: handleDeleteBookProps) => {
    if (
        !window.confirm(
            `The book "${book.title}" will be permanently deleted. This action is irreversible.\n\nContinue?`,
        )
    )
        return;

    fetchApi(
        `/api/delete-book/${book.id}/`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
        },
        {
            okCallback: callback,
            showToast: true,
        },
    );
};

export default handleDeleteBook;
