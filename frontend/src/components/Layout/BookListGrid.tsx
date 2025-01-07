import { BookListGridLoader } from "../SkeletonLoaders";

type BookListGridProps = {
    isLoading: boolean;
};

function BookListGrid({ isLoading }: BookListGridProps) {
    return isLoading ? <BookListGridLoader /> : <div>Books</div>;
}

export default BookListGrid;
