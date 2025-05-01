import { fetchApi, getCSRFToken } from "@/utils";

type handleUnborrowProps = {
    bookId: number;
    callback: () => void;
};

const handleUnborrow = ({ bookId, callback }: handleUnborrowProps) => {
    fetchApi(
        `/api/unborrow-book/${bookId}/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
        },
        {
            okCallback: callback,
        },
    );
};

export default handleUnborrow;
