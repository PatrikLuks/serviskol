
import posthog from 'posthog-js';

ReactGA.initialize('G-XXXXXXXXXX'); // TODO: nahraďte vlastním GA4 měřicím ID

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="flex gap-4 p-4 bg-primary-dark text-white items-center">
      <Link to="/" className="hover:underline">Domů</Link>
      {user && <Link to="/bikes" className="hover:underline">Moje kola</Link>}
      {user && <Link to="/admin/campaigns" className="hover:underline">Kampaně</Link>}
      {user && <Link to="/admin/campaigns-report" className="hover:underline">Přehled kampaní</Link>}
      {!user && <Link to="/login" className="hover:underline">Přihlášení</Link>}
      {!user && <Link to="/register" className="hover:underline">Registrace</Link>}
      {user && <span className="ml-4">Přihlášen: <b>{user.name}</b></span>}
      {user && <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} className="ml-2">Odhlásit</Button>}
    </nav>
  );
}

function App() {
  const [count, setCount] = useState(0)


  React.useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
    posthog.capture('$pageview');
  }, []);

  // Ukázka: zachycení klíčových akcí (doplnit do příslušných handlerů v komponentách)
  // posthog.capture('registrace', { email: ... });
  // posthog.capture('login', { email: ... });
  // posthog.capture('vytvoreni_servisni_zadosti', { ... });
  // posthog.capture('onboarding_dokonceno');
  // posthog.capture('ai_chat_dotaz', { dotaz: ... });
  // posthog.capture('export_dat');
  // posthog.capture('zobrazeni_analytiky');
  // posthog.capture('gamifikace_odmena');

  return (
    <Router>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold mb-6">Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white">
        <p className="mb-4">Toto je ukázka zeleného layoutu s TailwindCSS a MUI.</p>
        <Button variant="contained" color="success">
          MUI tlačítko
        </Button>
        <div className="mt-8 p-4 bg-primary-light rounded shadow">
          <span className="text-primary-dark font-semibold">Tailwind zelená komponenta</span>
        </div>
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/bikes" element={
          <PrivateRoute>
            <Bikes />
          </PrivateRoute>
        } />
        <Route path="/bikes/:id" element={
          <PrivateRoute>
            <BikeDetail />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/help" element={<Help />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/campaigns" element={<CampaignsAdmin />} />
        <Route path="/admin/campaigns-report" element={<CampaignsReport />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/notifications" element={<NotificationWidget />} />
        <Route path="/profile/settings" element={<ProfileSettings />} />
        <Route path="/admin/audit-log" element={<AuditLog />} />
        <Route path="/admin/gdpr-requests" element={<GdprRequests />} />
        <Route path="/ai-chat" element={
          <PrivateRoute>
            <AIChat />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App
