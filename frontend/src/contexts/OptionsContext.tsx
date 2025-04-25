import { createContext, useContext, useState, ReactNode } from "react";

type OptionsProps = {
    q?: string;
    search_in?: string;
    filter_author?: string[];
    filter_genre?: string[];
    filter_borrowed?: string;
    sort_by?: string;
    sort_desc?: boolean;
    pg_num?: number;
    pg_size: number;
};

type OptionsContextType = {
    options: OptionsProps;
    setOptions: React.Dispatch<React.SetStateAction<OptionsProps>>;
    toQueryParams: (opts: OptionsProps) => string;
    triggerRefresh: (type?: string) => void;
    refreshBooks: boolean;
    refreshFilters: boolean;
};

const OptionsContext = createContext<OptionsContextType | undefined>(undefined);

export const useOptions = () => {
    const context = useContext(OptionsContext);
    if (!context) throw new Error("useOptions must be used within OptionsProvider");
    return context;
};

export const OptionsProvider = ({ children }: { children: ReactNode }) => {
    const [options, setOptions] = useState<OptionsProps>({
        pg_size: 9,
        pg_num: 1,
    });

    const [refreshBooks, setRefreshBooks] = useState(false);
    const [refreshFilters, setRefreshFilters] = useState(false);

    const toQueryParams = (opts: OptionsProps = options) => {
        const params = new URLSearchParams();
        Object.entries(opts).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach((v) => params.append(key, String(v)));
                } else {
                    params.append(key, String(value));
                }
            }
        });
        return params.toString();
    };

    const triggerRefresh = (type?: string) => {
        if (type === "books") setRefreshBooks((prev) => !prev);
        else if (type === "filters") setRefreshFilters((prev) => !prev);
        else {
            setRefreshBooks((prev) => !prev);
            setRefreshFilters((prev) => !prev);
        }
    };

    return (
        <OptionsContext.Provider
            value={{
                options,
                setOptions,
                toQueryParams,
                triggerRefresh,
                refreshBooks,
                refreshFilters,
            }}
        >
            {children}
        </OptionsContext.Provider>
    );
};
