export type Book = {
    id: number;
    title: string;
    author: Author | null;
    dateAdded: Date;
    allowBorrow: boolean;
    genres: string[];
    borrowerName?: string;
    getDateAdded: (withTime?: boolean) => string;
};

export type Author = {
    id: number;
    name: string;
};

export type Genre = {
    id: number;
    name: string;
};

export function createBook(book: any): Book {
    const dateAdded = new Date(book.dateAdded);
    const genres = book.genres.map((genre: Genre) => genre.name);
    const getDateAdded = (withTime: boolean = false) => {
        return dateAdded.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            ...(withTime && { hour: "numeric", minute: "numeric" }),
        });
    };

    return {
        ...book,
        genres,
        dateAdded,
        getDateAdded,
    };
}
