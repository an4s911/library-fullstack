import { useEffect, useState } from "react";
import { FilterSection, SortSection } from "@/components/SearchFilter";
import { BookListGrid, PageNav } from "@/components/Layout";
import { LayoutToggleBtn } from "@/components/Layout";
import { FloatingInfo } from "@/components/Widgets";
import { FilterIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type HomePageProps = {};

function HomePage({}: HomePageProps) {
    const [isGrid, setIsGrid] = useState(
        JSON.parse(localStorage.getItem("isGrid") || "true"),
    );
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("isGrid", JSON.stringify(isGrid));
    }, [isGrid]);

    return (
        <main
            className="w-full h-full overflow-y-auto gap-4 md:gap-8 px-4 md:px-20 flex flex-col md:grid md:grid-cols-[250px_1fr]"
        >
            <div className={`h-max md:sticky md:top-0 md:pt-8 ${isFilterOpen ? 'pt-4' : 'pt-4'}`}>
                 <div
                    className="md:hidden flex items-center gap-2 mb-4 cursor-pointer bg-primary-50 dark:bg-primary-800 p-3 rounded shadow"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                 >
                    <FilterIcon size={20} className="text-primary"/>
                    <span className="font-bold text-primary-900 dark:text-primary-100">Filters</span>
                    {isFilterOpen ? <ChevronUpIcon size={20} className="ml-auto text-primary"/> : <ChevronDownIcon size={20} className="ml-auto text-primary"/>}
                 </div>

                 <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
                    <FilterSection />
                 </div>
            </div>
            <div className="flex flex-col gap-5 mt-4 md:mt-8">
                <div
                    className="w-full pb-2 flex flex-wrap md:flex-nowrap items-center
                    justify-between sticky top-0 md:top-8 z-10 gap-4 bg-primary-100/90 dark:bg-primary-900/90 p-2 rounded-b-md backdrop-blur-sm"
                >
                    <SortSection />
                    <div className="flex items-center gap-4 ml-auto md:ml-0">
                        <PageNav />
                        <LayoutToggleBtn
                            isGrid={isGrid}
                            onClick={() => setIsGrid(!isGrid)}
                        />
                    </div>
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
