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

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(getSavedUser);
  const [filters, setFilters] = useState({ city: '', minPrice: '', maxPrice: '' });
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const activePage = useMemo(() => (selectedListing ? 'home' : page), [page, selectedListing]);

  const loadListings = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const payload = await listingsApi.search(nextFilters);
      const apiListings = payload.data || [];
      setListings(apiListings.length ? apiListings : fallbackListings);
      setUsingDemoData(!apiListings.length);
    } catch {
      setListings(fallbackListings);
      setUsingDemoData(true);
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
          onSearch={search}
          onSelectListing={setSelectedListing}
        />
      )}
    </>
  );
}
