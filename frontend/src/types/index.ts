export type Book = {
    id?: number;
    title: string;
    author: number | null;
    dateAdded?: Date;
    allowBorrow: boolean;
    genres: string[];
};

export type Author = {
    id: number;
    name: string;
};
