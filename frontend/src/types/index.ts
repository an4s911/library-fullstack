export type Book = {
    id?: number;
    title: string;
    author: Author | null;
    dateAdded?: Date;
    allowBorrow: boolean;
    genres: string[];
    borrowerName?: string;
};

export type Author = {
    id: number;
    name: string;
};

export type Genre = {
    id: number;
    name: string;
};
