import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Orders from "./pages/Orders"
import Form from "./pages/Form";
import Prices from './pages/Prices';
import Users from "./pages/Users"
import Clients from './pages/Clients';
import ClientsPos from './pages/ClientsPos'
import AddClientPos from './pages/addClientPos';
import Branches from './pages/Branches';
import Sellers from './pages/Sellers';
import ChangePassword from './pages/ChangePassword';
import SendRecoveryPassword from "./pages/SendRecoveryPassword"
import RecoveryPassword from './pages/RecoveryPassword';
import Page404 from "./pages/Page404"
import Navbar from './components/Navbar';
import PrivateRoute from "./components/PrivateRoute";
import Requests from './pages/requests';
import { AuthContextProvider } from './context/authContext';
import { ClientContextProvider } from "./context/clientContext";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Descarga from './pages/desacargar';

function App() {
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        <Router>
          <Navbar />
          <div id='wrapper' className="d-flex vh-100 overflow-auto p-0">
            <Routes>
              <Route path='/' element={<Navigate to="/login" />} />
              <Route path='login' element={<Login />} />
              <Route path='/inicio' element={<PrivateRoute component={Orders} />} />
              <Route path='/pedido' element={<PrivateRoute component={Form} />} />
              <Route path='/solicitudes' element={<PrivateRoute component={Requests} />} />
              <Route path='/Auth/price' element={<PrivateRoute component={Prices} />} />
              <Route path='/usuarios' element={<PrivateRoute component={Users} />} />
              <Route path='/pos/clientes' element={<PrivateRoute component={Clients} />} />
              <Route path='/clientes/pos' element={<PrivateRoute component={ClientsPos} />} />
              <Route path='/add/clientes/pos' element={<PrivateRoute component={AddClientPos} />} />
              <Route path='/edit/client/pos/:id' element={<PrivateRoute component={AddClientPos} />} />
              <Route path='/pos/sucursales' element={<PrivateRoute component={Branches} />} />
              <Route path='/pos/vendedores' element={<PrivateRoute component={Sellers} />} />
              <Route path='/cambiar/contrasena' element={<PrivateRoute component={ChangePassword} />} />
              <Route path='/enviar/recuperacion' element={<SendRecoveryPassword/>} />
              <Route path='/recuperacion/contrasena/:token' element={<RecoveryPassword/>} />
              <Route path='*' element={<Page404 />} />

              <Route path='/descarga' element={<Descarga/>} />

            </Routes>
          </div>
        </Router>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
