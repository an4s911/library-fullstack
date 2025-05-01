import { toast } from "react-toastify";

type FetchApiOptions = {
    okCallback?: () => void;
    dataCallback?: (data: any) => void;
    showToast?: boolean;
};

const fetchApi = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    { okCallback, dataCallback, showToast = false }: FetchApiOptions = {},
) => {
    if (typeof input === "string" && input.startsWith("/api")) {
        const baseUrl = import.meta.env.VITE_API_URL;
        input = baseUrl + input;
    }

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

export default fetchApi;
