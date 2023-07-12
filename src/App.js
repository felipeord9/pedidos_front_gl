import Form from "./pages/Form";
import { ClientContextProvider } from "./context/clientContext";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <ClientContextProvider>
      <div
        className="container d-flex justify-content-center align-items-start"
        style={{ minHeight: "100vh" }}
      >
        <Form />
      </div>
    </ClientContextProvider>
  );
}

export default App;
