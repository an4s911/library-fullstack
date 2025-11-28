type BookListGridProps = {
    isGrid: boolean;
};

function BookListGrid({ isGrid }: BookListGridProps) {
    return (
        <div
            className={`book-list-grid ${isGrid ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"} gap-5`}
        >
            {Array.from({ length: Math.floor(Math.random() * 4) + 4 }).map(
                (_, index) => {
                    return (
                        <div
                            key={index}
                            className="rounded-md h-32 w-full flex flex-col p-4 justify-between
                            bg-primary-50 dark:bg-primary-700
                            shadow-gray-500 dark:shadow-gray-800
                            gap-3 shadow-md transition-transform"
                        >
                            {Array.from({ length: 2 }).map((_, index) => {
                                const minPercentage = 40;
                                return (
                                    <div
                                        style={{
                                            width: `${Math.floor(Math.random() * (100 - minPercentage)) + minPercentage}%`,
                                        }}
                                        key={index}
                                        className="h-full bg-primary-200 dark:bg-primary-600 rounded-md animate-pulse"
                                    ></div>
                                );
                            })}
                            <div className="flex gap-4">
                                {Array.from({
                                    length: Math.floor(Math.random() * 3) + 2,
                                }).map((_, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="h-5 w-20 bg-primary-200 dark:bg-primary-600 rounded-full animate-pulse"
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                },
            )}
        </div>
    );
}

export default BookListGrid;
