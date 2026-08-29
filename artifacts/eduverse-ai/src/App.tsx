import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { CareersPage, DashboardPage, LearnPage, PlannerPage, ProfilePage, RoadmapPage, Shell, SkillsPage, AskPage } from '@/components/eduverse-app';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Shell><Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/learn" component={LearnPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/roadmap" component={RoadmapPage} />
        <Route path="/skills" component={SkillsPage} />
        <Route path="/ask" component={AskPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch></Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
