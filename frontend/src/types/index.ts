export type Book = {
    id?: number;
    title: string;
    author: Author | null;
    dateAdded: Date;
    allowBorrow: boolean;
    genres: string[];
    borrowerName?: string;
    getDateAdded: () => string;
};

export type Author = {
    id: number;
    name: string;
};

export type Genre = {
    id: number;
    name: string;
};

export function createBook(book: Book): Book {
    const dateAdded = new Date(book.dateAdded);
    const getDateAdded = () => {
        return dateAdded.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return {
        ...book,
        dateAdded,
        getDateAdded,
    };
}
