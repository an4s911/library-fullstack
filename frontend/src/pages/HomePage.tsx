import { useEffect, useState } from "react";
import { FilterSection, SortSection } from "@/components/SearchFilter";
import { BookListGrid, PageNav } from "@/components/Layout";
import { LayoutToggleBtn } from "@/components/Layout";
import { usePageContext } from "@/contexts";
import { FloatingInfo } from "@/components/Widgets";

type HomePageProps = {};

function HomePage({}: HomePageProps) {
    const [isGrid, setIsGrid] = useState(
        JSON.parse(localStorage.getItem("isGrid") || "true"),
    );
    const { totalPages, currentPage, nextPage, prevPage } = usePageContext();

    useEffect(() => {
        localStorage.setItem("isGrid", JSON.stringify(isGrid));
    }, [isGrid]);

    return (
        <main
            style={{
                display: "grid",
                gridTemplateColumns: "250px 1fr",
            }}
            className="px-20 w-full h-full overflow-y-auto gap-8"
        >
            <div className="h-max sticky top-0 pt-8">
                <FilterSection />
            </div>
            <div className="flex flex-col gap-5 mt-8">
                <div
                    className="w-full pb-2 flex items-center
                    justify-between sticky top-8 z-10"
                >
                    <SortSection />
                    <PageNav
                        totalPages={totalPages}
                        currentPage={currentPage}
                        nextPage={nextPage}
                        prevPage={prevPage}
                    />
                    <LayoutToggleBtn
                        isGrid={isGrid}
                        onClick={() => setIsGrid(!isGrid)}
                    />
                </div>
                <div className="pb-8">
                    <BookListGrid isGrid={isGrid} />
                </div>
            </div>
            <FloatingInfo />
        </main>
    );
}

export default HomePage;
