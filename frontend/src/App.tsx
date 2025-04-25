import { Header } from "./components/Layout";
import MainContent from "./components/Layout/MainContent";
import { ModalProvider, OptionsProvider, useModal } from "@/contexts";

function App() {
    const { isModalOpen } = useModal();

    return (
        <div
            style={{
                display: "grid",
                gridTemplateRows: "auto 1fr",
            }}
            className={`app ${isModalOpen ? "max-h-screen overflow-hidden" : ""}`}
        >
            <OptionsProvider>
                <ModalProvider>
                    <Header />
                    <MainContent />
                </ModalProvider>
            </OptionsProvider>
        </div>
    );
}

export default App;
