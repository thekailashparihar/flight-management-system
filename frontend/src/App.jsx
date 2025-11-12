import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Header from "./common/Header";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
    return (
        <>
            <BrowserRouter>
                <Header />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="*" element={<h2>404 Page Not Found</h2>} />
                    </Routes>
                </main>

                <Footer />
            </BrowserRouter>
        </>
    );
}

export default App;
