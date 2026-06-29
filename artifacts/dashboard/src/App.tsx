import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import AlertsPage from "@/pages/alerts";
import AlertDetailPage from "@/pages/alert-detail";
import RecordingsPage from "@/pages/recordings";
import ContactsPage from "@/pages/contacts";
import LocationPage from "@/pages/location";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/alerts/:alertId">
        {(params) => <AlertDetailPage alertId={params.alertId} />}
      </Route>
      <Route path="/recordings" component={RecordingsPage} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/location" component={LocationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("safeguard-theme") === "dark";
  });

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000";
    setBaseUrl(apiBaseUrl);
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("safeguard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)}>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
