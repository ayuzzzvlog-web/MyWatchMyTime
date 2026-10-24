import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CompareProvider, SettingsProvider, ShortlistProvider, ToastProvider } from './lib/store';
import Home from './pages/Home';
import Collection from './pages/Collection';
import WatchDetail from './pages/WatchDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (!search) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <ShortlistProvider>
          <CompareProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route
                path="*"
                element={
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/collection" element={<Collection />} />
                      <Route path="/watch/:slug" element={<WatchDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppShell>
                }
              />
            </Routes>
          </CompareProvider>
        </ShortlistProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
