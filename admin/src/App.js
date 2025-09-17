import { BrowserRouter } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";

export const backend_url = 'https://ecommerce-backend-ldpj.onrender.com';
export const currency = 'LKR';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Admin />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
