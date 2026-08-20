import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PrivateBooking from './pages/PrivateBooking';
import BusinessBooking from './pages/BusinessBooking';

export default function App() {
  return (
    <div className="min-h-screen bg-cream" data-testid="app-root">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privat" element={<PrivateBooking />} />
        <Route path="/foretag" element={<BusinessBooking />} />
      </Routes>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
}
