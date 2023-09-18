import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Form from "./pages/Form";
import PrivateRoute from "./components/PrivateRoute"
import { AuthContextProvider } from './context/authContext';
import { ClientContextProvider } from "./context/clientContext";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        <Router>
          <div className="d-flex flex-row min-vh-100">
            <Routes>
              <Route path='/' element={<Navigate to="/login" />} />
              <Route path='login' element={<Login />} />
              <Route path='/pedido' element={<PrivateRoute component={Form} />} />
            </Routes>
          </div>
        </Router>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
