import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [mode, setMode] = useState(""); 
    const [token, setToken] = useState("");
    const [joinToken, setJoinToken] = useState("");
    const navigate = useNavigate()

    function generateToken() {
        const options = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = "";
        for (let i = 0; i < 16; i++) {
            token += options[Math.floor(Math.random() * options.length)];
        }
        return token;
    }

    const handleCreateClick = () => {
        const newToken = generateToken();
        setToken(newToken);
        setMode("create");
        setShowPopup(true);
    };

    const handleJoinClick = () => {
        setMode("join");
        setShowPopup(true);
    };

    const handleGoClick = () => {
        if (mode === "create") {
            console.log("Session Created with Token:", token);
            navigate(`/session/${token}`)
            // Navigate or take action using the generated token
        } else if (mode === "join") {
            console.log("Joining Session with Token:", joinToken);
            navigate(`/session/${joinToken}`)
            // Navigate or take action using the entered token
        }
        
        setShowPopup(false);
    };

    return (
        <>
            <div className="flex gap-10 justify-center mt-20">
                <button onClick={handleCreateClick} className="p-[3px] relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                    <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
                        Create new session
                    </div>
                </button>
                <button onClick={handleJoinClick} className="p-[3px] relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                    <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent">
                        Join a session
                    </div>
                </button>
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg text-center space-y-4">
                        {mode === "create" && (
                            <>
                                <h2 className="text-xl font-semibold">Your Session Token</h2>
                                <p className="font-mono text-lg break-all">{token}</p>
                                <button
                                    onClick={handleGoClick}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Go
                                </button>
                            </>
                        )}
                        {mode === "join" && (
                            <>
                                <h2 className="text-xl font-semibold">Enter Session Token</h2>
                                <input
                                    type="text"
                                    className="border p-2 w-full rounded-md"
                                    value={joinToken}
                                    onChange={(e) => setJoinToken(e.target.value)}
                                    placeholder="Enter token..."
                                />
                                <button
                                    onClick={handleGoClick}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    Go
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="mx-5 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Cancel
                        </button>
                        
                    </div>
                </div>
            )}
        </>
    );
}

export default LandingPage;
