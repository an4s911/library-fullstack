import { Library } from "lucide-react";
import { AddBookBtn } from "../Book";
import { SearchBar } from "../SearchFilter";
import ThemeToggle from "./ThemeToggle";

type HeaderProps = {};

function Header({}: HeaderProps) {
    return (
        <header className="flex justify-between items-center">
            <div className="title-logo flex items-center">
                <div className="logo">
                    <Library />
                </div>
                <div className="title">
                    <h1>A-Library</h1>
                </div>
            </div>

            <div className="search-bar">
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
