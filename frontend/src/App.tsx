import { Header, MainContent } from "@/components/Layout";
import { OptionsProvider, PageContextProvider, useModal } from "@/contexts";

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
                <Header />
                <PageContextProvider>
                    <MainContent />
                </PageContextProvider>
            </OptionsProvider>
        </div>
    );
}

export default App;
