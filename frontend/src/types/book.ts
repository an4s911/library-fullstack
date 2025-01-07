export type Genre = {
    id: number;
    name: string;
};

export type Book = {
    id: number;
    title: string;
    author: string;
    dateAdded: Date;
    genres: Genre[];
};
