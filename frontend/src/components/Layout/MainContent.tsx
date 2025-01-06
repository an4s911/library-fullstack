import { FilterSection, SortSection } from "../SearchFilter";
import BookListGrid from "./BookListGrid";
import LayoutToggleBtn from "./LayoutToggleBtn";

type MainContentProps = {};

function MainContent({}: MainContentProps) {
    return (
        <main
            style={{
                display: "grid",
                gridTemplateColumns: "250px 1fr",
            }}
            className="px-20 py-10 w-full h-full gap-x-5"
        >
            <FilterSection />
            <div className="flex flex-col">
                <div className="w-full flex justify-between sticky top-28 bg-primary-100 dark:bg-primary-900 py-2">
                    <SortSection />
                    <LayoutToggleBtn />
                </div>
                <BookListGrid />
            </div>
        </main>
    );
}

export default MainContent;
