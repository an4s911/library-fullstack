import { toast } from "react-toastify";

const getCSRFToken = () => {
    const cookie = document.cookie;

    if (!cookie) return "";

    const csrftokenCookie = cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrftoken="))!;

    return csrftokenCookie.split("=")[1];
};

type FetchWithToastOptions = {
    okCallback?: () => void;
    dataCallback?: (data: any) => void;
    showToast?: boolean;
};

const fetchWithToast = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    { okCallback, dataCallback, showToast = true }: FetchWithToastOptions = {},
) => {
    fetch(input, init)
        .then((res) => {
            if (res.ok) {
                okCallback && okCallback();
            }
            return res.json();
        })
        .then((data) => {
            if (showToast) {
                if (data.error) {
                    toast.error(data.error);
                } else if (data.message) {
                    toast.success(data.message);
                }
            }
            dataCallback && dataCallback(data);
        });
};

export { getCSRFToken, fetchWithToast };
