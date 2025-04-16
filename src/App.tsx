
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";
import "./print-styles.css";
import { AuthProvider } from "./lib/auth";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
