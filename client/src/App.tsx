import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SolanaProvider } from "./providers/SolanaProvider";
import { ThemeProvider } from "./contexts/ThemeContext";

import Layout from "./components/Layout";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventSuccess from "./pages/EventSuccess";
import ClaimToken from "./pages/ClaimToken";
import ClaimSuccess from "./pages/ClaimSuccess";
import MyTokens from "./pages/MyTokens";
import Achievements from "./pages/Achievements";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create-event" component={CreateEvent} />
      <Route path="/event-success/:id" component={EventSuccess} />
      <Route path="/claim/:eventId" component={ClaimToken} />
      <Route path="/claim-success/:eventId" component={ClaimSuccess} />
      <Route path="/my-tokens" component={MyTokens} />
      <Route path="/achievements" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SolanaProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </SolanaProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
