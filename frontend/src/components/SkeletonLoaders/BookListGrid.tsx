type BookListGridProps = {};

function BookListGrid({}: BookListGridProps) {
    return (
        <div className="book-list-grid grid grid-cols-3 gap-5">
            {Array.from({ length: Math.floor(Math.random() * 4) + 4 }).map(
                (_, index) => {
                    return (
                        <div
                            key={index}
                            className="rounded-md h-44 w-full flex flex-col p-4 justify-between
                            bg-primary-50 dark:bg-primary-700
                            shadow-gray-500 dark:shadow-gray-800
                            gap-3 shadow-md transition-transform"
                        >
                            {Array.from({ length: 3 }).map((_, index) => {
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
                            <div className="flex flex-wrap gap-4">
                                {Array.from({
                                    length: Math.floor(Math.random() * 2) + 3,
                                }).map((_, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className="h-5 w-20 bg-primary-200 dark:bg-primary-600 rounded-md animate-pulse"
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
