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
            <PageContextProvider>
                <OptionsProvider>
                    <ModalProvider>
                        <Header />
                        <MainContent />
                    </ModalProvider>
                </OptionsProvider>
            </PageContextProvider>
        </div>
    );
}

export default App;
