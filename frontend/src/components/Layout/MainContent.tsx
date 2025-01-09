import { useState } from "react";
import { FilterSection, SortSection } from "../SearchFilter";
import BookListGrid from "./BookListGrid";
import LayoutToggleBtn from "./LayoutToggleBtn";

type MainContentProps = {};

function MainContent({}: MainContentProps) {
    const [isGrid, setIsGrid] = useState(true);

    return (
        <main
            style={{
                display: "grid",
                gridTemplateColumns: "250px 1fr",
            }}
            className="px-20 py-8 w-full h-max gap-8 mt-20"
        >
            <FilterSection />
            <div className="flex flex-col gap-5">
                <div className="w-full flex items-center justify-between sticky top-28 z-10">
                    <SortSection />
                    <LayoutToggleBtn
                        isGrid={isGrid}
                        onClick={() => setIsGrid(!isGrid)}
                    />
                </div>
                <BookListGrid isGrid={isGrid} />
            </div>
        </main>
    );
}

export default MainContent;
