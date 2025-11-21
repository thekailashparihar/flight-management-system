import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { ProtectedRoutes, PublicRoutes } from "./components/AuthRoutes";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Header />

                <main>
                    <Routes>
                        <Route element={<ProtectedRoutes />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>

                        <Route element={<PublicRoutes />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                        </Route>

                        <Route path="/" element={<Home />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/contact-us" element={<ContactUs />} />
                        <Route path="*" element={<h2>404 Page Not Found</h2>} />
                    </Routes>
                </main>

                <Footer />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
