import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ListingPage } from './pages/ListingPage';
import { AddCenterPage } from './pages/AddCenterPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<ListingPage />} />
            <Route path="/agregar" element={<AddCenterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
