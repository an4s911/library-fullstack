import { useState } from "react";
import { Header } from "./components/Layout";
import MainContent from "./components/Layout/MainContent";

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateRows: "auto 1fr",
            }}
            className={`app ${isModalOpen ? "max-h-screen overflow-hidden" : ""}`}
        >
            <Header
                onModalOpen={() => setIsModalOpen(true)}
                onModalClose={() => setIsModalOpen(false)}
            />
            <MainContent />
        </div>
    );
}

export default App;
