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
            className="app h-screen overflow-hidden flex flex-col md:grid md:grid-rows-[auto_1fr]"
        >
            <PageContextProvider>
                <OptionsProvider>
                    <Header />
                    <HomePage />
                    <ToastContainer />
                </OptionsProvider>
            </PageContextProvider>
        </div>
    );
}

export default App;
