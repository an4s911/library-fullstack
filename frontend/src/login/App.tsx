import { XIcon } from "lucide-react";
import { useState } from "react";

type AppProps = {};

function App({}: AppProps) {
    const [errorMessage, setErrorMessage] = useState<string>();

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);
        const nextUrl = new URLSearchParams(window.location.search).get("next");

        const actionUrl = `/login/${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`;

        fetch(actionUrl, {
            method: "POST",
            body: formData,
        })
            .then(async (response) => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    const resData = await response.json();
                    setErrorMessage(resData.message);
                }
            })
            .catch((error) => {
                console.error("Error during form submission:", error);
                alert("An unexpected error occurred.");
            });
    };

    return (
        <main className="flex items-center justify-center h-screen w-screen bg-gray-100">
            <div className="flex flex-col gap-2 w-80">
                {errorMessage && (
                    <div className="flex justify-between bg-red-500 text-white p-2 rounded text-center">
                        <span>{errorMessage}</span>
                        <XIcon
                            className="text-white hover:text-gray-200 cursor-pointer"
                            onClick={() => {
                                setErrorMessage("");
                            }}
                        />
                    </div>
                )}
                <div className="border shadow p-10 flex flex-col gap-3 relative rounded-md bg-white">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleFormSubmit}
                    >
                        <section>
                            <label htmlFor="">Username:</label>
                            <input
                                name="username"
                                type="text"
                                className="username"
                                required
                            />
                        </section>
                        <section>
                            <label htmlFor="">Password:</label>
                            <input
                                name="password"
                                type="password"
                                className="password"
                                required
                            />
                        </section>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white hover:bg-blue-700 p-2 rounded"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default App;
