import { Header, MainContent } from "@/components/Layout";
import { OptionsProvider, PageContextProvider } from "@/contexts";
import { ModalProvider } from "@/contexts";

function App() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateRows: "auto 1fr",
            }}
            className="app h-screen overflow-hidden"
        >
            <OptionsProvider>
                <ModalProvider>
                    <Header />
                    <PageContextProvider>
                        <MainContent />
                    </PageContextProvider>
                </ModalProvider>
            </OptionsProvider>
        </div>
    );
}

export default App;
