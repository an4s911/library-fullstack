import { Header } from "@/components/Layout";
import { HomePage } from "@/pages";
import { OptionsProvider, PageContextProvider } from "@/contexts";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

function App() {
    useEffect(() => {
        document.title = import.meta.env.VITE_APP_NAME;
    }, []);

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
                    <Header />
                    <HomePage />
                    <ToastContainer />
                    <Header />
                </OptionsProvider>
            </PageContextProvider>
        </div>
    );
}

export default App;
