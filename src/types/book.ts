export interface Book {
    id: string;
    title: string;
    author: string;
    genres: string[];
    allowBorrowing: boolean;
    borrower?: string;
    borrowedAt?: Date;
}

export type ViewMode = 'grid' | 'list';
