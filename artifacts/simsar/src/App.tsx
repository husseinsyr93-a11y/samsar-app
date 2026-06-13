import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { initAdMob } from "@/lib/admob";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setBaseUrl } from "@workspace/api-client-react";
import { getApiBaseUrl } from "@/capacitor-api";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import Matches from "@/pages/matches";
import Favorites from "@/pages/favorites";
import Messages from "@/pages/messages";
import Neighborhoods from "@/pages/neighborhoods";
import AiAssistant from "@/pages/ai-assistant";
import Admin from "@/pages/admin";
import AddProperty from "@/pages/add-property";

// Resolve API base URL before first render.
// On Android WebView, Capacitor serves from http://localhost so relative "/api"
// would hit the wrong host. This sets the correct absolute URL for native builds.
setBaseUrl(getApiBaseUrl());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:id" component={PropertyDetail} />
        <Route path="/matches" component={Matches} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/messages" component={Messages} />
        <Route path="/neighborhoods" component={Neighborhoods} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/admin" component={Admin} />
        <Route path="/add-property" component={AddProperty} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  useEffect(() => {
    initAdMob().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base="">
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
