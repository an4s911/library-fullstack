import { Header } from "./components/Layout";
import MainContent from "./components/Layout/MainContent";

function App() {
    return (
        <div className="text-primary-900 dark:text-primary-100 h-screen">
            <Header />
            <MainContent />
        </div>
    );
}

export default App;
