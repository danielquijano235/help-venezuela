import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ListingPage } from './pages/ListingPage';
import { AddCenterPage } from './pages/AddCenterPage';
import { AyudaPage } from './pages/AyudaPage';
import { NoticiasPage } from './pages/NoticiasPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoadingSpinner } from './components/LoadingSpinner';

// Cargado bajo demanda: leaflet agrega ~150kb gzip que la mayoria de las
// paginas no necesita.
const MapaPage = lazy(() => import('./pages/MapaPage').then((m) => ({ default: m.MapaPage })));

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<ListingPage />} />
            <Route path="/agregar" element={<AddCenterPage />} />
            <Route path="/ayuda" element={<AyudaPage />} />
            <Route
              path="/mapa"
              element={
                <Suspense fallback={<LoadingSpinner label="Cargando mapa..." />}>
                  <MapaPage />
                </Suspense>
              }
            />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
