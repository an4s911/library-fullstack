import { FilterIcon } from "lucide-react";

type FilterSectionProps = {};

function FilterSection({}: FilterSectionProps) {
    return (
        <section className="filter-section flex flex-col bg-primary-50 dark:bg-primary-700 px-5 py-3 rounded-md shadow h-max sticky top-28">
            <div className="flex justify-between">
                <h2>Filter</h2>
                <FilterIcon />
            </div>
            <div className="authors">
                <h3>Authors</h3>
            </div>
            <div className="genres">
                <h3>Genres</h3>
            </div>
        </section>
    );
}

export default FilterSection;
