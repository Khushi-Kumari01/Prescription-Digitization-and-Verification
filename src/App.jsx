import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import ToastContainer from './components/Toast';
import './styles/globals.css';

function AppRouter() {
  const { user } = useApp();
  return (
    <>
      {user ? <Dashboard /> : <LoginPage />}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
