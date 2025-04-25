import { useEffect, useState } from "react";
import { FilterSection, SortSection } from "../SearchFilter";
import BookListGrid from "./BookListGrid";
import LayoutToggleBtn from "./LayoutToggleBtn";

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

type MainContentProps = {};

function MainContent({}: MainContentProps) {
    const [options, setOptions] = useState<OptionsProps>({
        pg_size: 8,
        pg_num: 1,
    });

    const [isGrid, setIsGrid] = useState(
        JSON.parse(localStorage.getItem("isGrid") || "true"),
    );

    useEffect(() => {
        localStorage.setItem("isGrid", JSON.stringify(isGrid));
    }, [isGrid]);

    return (
        <main
            style={{
                display: "grid",
                gridTemplateColumns: "250px 1fr",
            }}
            className="px-20 pb-8 w-full h-max gap-8 mt-20"
        >
            <FilterSection setOptions={setOptions} />
            <div className="flex flex-col gap-5">
                <div
                    className="w-full pt-8 pb-2 flex items-center
                    justify-between sticky top-20 z-10"
                >
                    <SortSection setOptions={setOptions} />
                    <LayoutToggleBtn
                        isGrid={isGrid}
                        onClick={() => setIsGrid(!isGrid)}
                    />
                </div>
                <BookListGrid
                    isGrid={isGrid}
                    options={options}
                    setOptions={setOptions}
                />
            </div>
        </main>
    );
}

export default MainContent;
export type { OptionsProps };
