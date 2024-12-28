import { Library } from "lucide-react";
import { AddBookBtn } from "../Book";
import { SearchBar } from "../SearchFilter";
import ThemeToggle from "./ThemeToggle";

type HeaderProps = {};

function Header({}: HeaderProps) {
    return (
        <header className="flex justify-between items-center bg-white sticky top-0 w-full shadow px-28 h-20 box-border py-4">
            <div className="title-logo flex items-center gap-2">
                <div className="logo text-primary">
                    <Library size={32} />
                </div>
                <div className="title text-2xl font-bold">
                    <h1>A-Library</h1>
                </div>
            </div>

            <div className="search-bar flex-1 max-w-lg min-w-max">
                <SearchBar />
            </div>

            <div className="actions flex items-center">
                <div className="theme-toggle">
                    <ThemeToggle />
                </div>
                <div className="add-book-btn">
                    <AddBookBtn />
                </div>
            </div>
        </header>
    );
}

export default Header;
