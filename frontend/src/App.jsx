import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import { fallbackListings } from './data/fallbackListings';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import ListingDetail from './pages/ListingDetail';
import { listingsApi } from './services/api';

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('staysimple_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('staysimple_user');
    localStorage.removeItem('staysimple_token');
    return null;
  }
};

const normalizeFilters = (nextFilters) => ({
  city: nextFilters.city.trim(),
  minPrice: nextFilters.minPrice,
  maxPrice: nextFilters.maxPrice,
});

const filterDemoListings = (nextFilters) => {
  const city = nextFilters.city.trim().toLowerCase();
  const minPrice = nextFilters.minPrice ? Number(nextFilters.minPrice) : null;
  const maxPrice = nextFilters.maxPrice ? Number(nextFilters.maxPrice) : null;

  return fallbackListings.filter((listing) => {
    const matchesCity = city ? listing.city.toLowerCase().includes(city) : true;
    const matchesMin = minPrice !== null ? Number(listing.price) >= minPrice : true;
    const matchesMax = maxPrice !== null ? Number(listing.price) <= maxPrice : true;

    return matchesCity && matchesMin && matchesMax;
  });
};

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(getSavedUser);
  const [filters, setFilters] = useState({ city: '', minPrice: '', maxPrice: '' });
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const activePage = useMemo(() => (selectedListing ? 'home' : page), [page, selectedListing]);

  const loadListings = async (nextFilters = filters) => {
    setLoading(true);
    const cleanFilters = normalizeFilters(nextFilters);
    try {
      const payload = await listingsApi.search(cleanFilters);
      const apiListings = payload.data || [];
      setListings(apiListings);
      setUsingDemoData(false);
      setApiUnavailable(false);
    } catch {
      setListings(filterDemoListings(cleanFilters));
      setUsingDemoData(true);
      setApiUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const search = (event) => {
    event.preventDefault();
    loadListings(filters);
  };

  const navigate = (nextPage) => {
    setSelectedListing(null);
    setPage(nextPage);
    if (nextPage === 'home') {
      const emptyFilters = { city: '', minPrice: '', maxPrice: '' };
      setFilters(emptyFilters);
      loadListings(emptyFilters);
    }
  };

  const logout = () => {
    localStorage.removeItem('staysimple_token');
    localStorage.removeItem('staysimple_user');
    setUser(null);
    navigate('home');
  };

  const authenticate = (nextUser) => {
    setUser(nextUser);
    navigate('dashboard');
  };

  return (
    <>
      <Header user={user} activePage={activePage} onNavigate={navigate} onLogout={logout} />

      {selectedListing ? (
        <ListingDetail
          listing={selectedListing}
          user={user}
          onBack={() => setSelectedListing(null)}
          onRequireAuth={() => navigate('auth')}
        />
      ) : page === 'auth' ? (
        <AuthPage onAuth={authenticate} />
      ) : page === 'dashboard' && user ? (
        <Dashboard user={user} />
      ) : (
        <HomePage
          filters={filters}
          setFilters={setFilters}
          listings={listings}
          loading={loading}
          usingDemoData={usingDemoData}
          apiUnavailable={apiUnavailable}
          onSearch={search}
          onSelectListing={setSelectedListing}
        />
      )}
    </>
  );
}
