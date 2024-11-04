import { useEffect } from "react";
import AgentDashboard from "./pages/dashboard";
import { useAuthStore } from "./Checks/Auth";
import { Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/login";
import Register from "./pages/register";
import CookieConsent from "./components/cookie-consent";

function App() {
  const initialise = useAuthStore((state) => state.initialise);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const success = await initialise(); // Wait for the initialise function to complete
    if (!success) {
      navigate("/login");
      return ;
      
    }
  };
  useEffect(() => {

    checkAuth();
  }, []); // Add dependencies to rerun effect

  return (
    <div className="w-full ">
        <CookieConsent />
      <Routes>
        <Route path="/" element={<AgentDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;