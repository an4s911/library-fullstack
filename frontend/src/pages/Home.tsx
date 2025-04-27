import { useEffect, useState } from "react";
import { FilterSection, SortSection } from "@/components/SearchFilter";
import { BookListGrid, PageNav } from "@/components/Layout";
import { LayoutToggleBtn } from "@/components/Layout";
import { usePageContext } from "@/contexts";

type HomeProps = {};

function Home({}: HomeProps) {
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
            className="px-20 pb-8 w-full h-screen overflow-y-scroll gap-8"
        >
            <FilterSection />
            <div className="flex flex-col gap-5">
                <div
                    className="w-full pt-8 pb-2 flex items-center
                    justify-between sticky top-20 z-10"
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
                <BookListGrid isGrid={isGrid} />
            </div>
        </main>
    );
}

export default Home;
