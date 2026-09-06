import { fetchApi, getCSRFToken } from "@/utils";
import { Author, Genre } from "@/types";

export type EditBookData = {
    title?: string;
    author_id?: number | null;
    genre_ids?: number[];
    allowBorrow?: boolean;
};

export type EditBookApiResponse = {
    message?: string;
    book?: {
        id: number;
        title: string;
        author: Author | null;
        dateAdded: string;
        genres: Genre[];
        allowBorrow: boolean;
    };
    error?: string;
};

type HandleEditBookProps = {
    bookId: number;
    data: EditBookData;
    callback?: () => void;
    dataCallback?: (data: EditBookApiResponse) => void;
};

const handleEditBook = ({
    bookId,
    data,
    callback,
    dataCallback,
}: HandleEditBookProps) => {
    fetchApi(
        `/api/edit-book/${bookId}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
            body: JSON.stringify(data),
        },
        {
            okCallback: callback,
            dataCallback: dataCallback,
            showToast: true,
        },
    );
};

export default handleEditBook;
