import { type ReactNode, useMemo } from 'react';
import { ClerkProvider, SignIn, SignUp, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { CareersPage, DashboardPage, LearnPage, PlannerPage, ProfilePage, RoadmapPage, Shell, SkillsPage, AskPage } from '@/components/eduverse-app';
import { CommunityPage, OpportunitiesPage, RefreshmentPage, TeacherPage } from '@/pages/extended-pages';
import { clearEduVerseRole, getEduVerseRole, setEduVerseRole, type EduVerseRole } from '@/lib/auth';
import { ArrowRight, BookOpen, GraduationCap, School, Sparkles } from 'lucide-react';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#234d40',
    colorForeground: '#234d40',
    colorMutedForeground: '#61746c',
    colorDanger: '#c96052',
    colorBackground: '#faf7ef',
    colorInput: '#f4efe4',
    colorInputForeground: '#234d40',
    colorNeutral: '#d9cfbd',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#faf7ef] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#234d40] font-bold',
    headerSubtitle: 'text-[#61746c]',
    socialButtonsBlockButtonText: 'text-[#234d40] font-semibold',
    formFieldLabel: 'text-[#234d40] font-semibold',
    footerActionLink: 'text-[#234d40] font-bold',
    footerActionText: 'text-[#61746c]',
    dividerText: 'text-[#61746c]',
    identityPreviewEditButton: 'text-[#234d40]',
    formFieldSuccessText: 'text-[#234d40]',
    alertText: 'text-[#8b3e36]',
    logoBox: 'mb-5',
    logoImage: 'max-h-12',
    socialButtonsBlockButton: 'border-[#d9cfbd] bg-[#f4efe4] hover:bg-[#eee5d4]',
    formButtonPrimary: 'bg-[#234d40] text-[#faf7ef] hover:bg-[#183b31]',
    formFieldInput: 'border-[#d9cfbd] bg-[#f4efe4] text-[#234d40]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d9cfbd]',
    alert: 'border-[#edc4bd] bg-[#fff3f0]',
    otpCodeFieldInput: 'border-[#d9cfbd] bg-[#f4efe4] text-[#234d40]',
    formFieldRow: 'mb-4',
    main: 'gap-5',
  },
};

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

function AuthLoading() {
  return <div className="grid min-h-[100dvh] place-items-center bg-background"><Sparkles className="h-6 w-6 animate-pulse text-primary" /></div>;
}

function RoleCard({ role, title, detail, icon: Icon }: { role: EduVerseRole; title: string; detail: string; icon: typeof GraduationCap }) {
  return (
    <button
      type="button"
      data-testid={`button-login-${role}`}
      onClick={() => {
        setEduVerseRole(role);
        window.location.href = `${basePath}/sign-in`;
      }}
      className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/30 text-primary"><Icon className="h-6 w-6" /></div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </button>
  );
}

function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary"><GraduationCap className="h-5 w-5" /></span>
            <span className="font-serif text-2xl font-bold text-foreground">EduVerse</span>
          </Link>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-muted-foreground">Welcome in</p>
          <h1 className="font-serif text-4xl font-semibold tracking-[-.03em] sm:text-5xl">How will you use EduVerse?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Choose your space so we can take you to the right sign-in and show you the tools made for your role.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RoleCard role="student" title="Student login" detail="Your personalized learning desk, planner, career path, and AI study companion." icon={BookOpen} />
          <RoleCard role="teacher" title="Teacher login" detail="Your private teacher workspace for classes, progress signals, and review queues." icon={School} />
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">New to EduVerse? You can create an account after choosing your role.</p>
      </div>
    </main>
  );
}

function LandingPage() {
  return (
    <main className="flex min-h-[100dvh] items-center bg-background px-6 py-12">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <div className="mb-10 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary"><GraduationCap className="h-5 w-5" /></div><span className="font-serif text-2xl font-bold">EduVerse</span></div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-muted-foreground">A calmer way forward</p>
          <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[1.04] tracking-[-.04em] sm:text-7xl">Keep learning pointed at the life you want.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">Personalized study help, thoughtful planning, career discovery, and a community for the in-between moments.</p>
          <Link href="/login" data-testid="link-get-started" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg">Choose your login <ArrowRight className="h-4 w-4" /></Link>
        </section>
        <section className="ink-grid rounded-[2rem] border border-border bg-card p-7 sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-primary">Built for both sides of learning</p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/30 text-primary"><BookOpen className="h-5 w-5" /></div><div><h2 className="font-serif text-2xl font-bold">Student space</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A next step that feels personal, not generic.</p></div></div>
            <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><School className="h-5 w-5" /></div><div><h2 className="font-serif text-2xl font-bold">Teacher space</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">A private view of classroom momentum and student work.</p></div></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/`} /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/`} /></div>;
}

function AppRouter() {
  const { isLoaded, isSignedIn } = useAuth();
  const [location] = useLocation();
  const role = getEduVerseRole();
  const publicPath = useMemo(() => location === '/' || location === '/login' || location.startsWith('/sign-in') || location.startsWith('/sign-up'), [location]);

  if (!isLoaded) return <AuthLoading />;
  if (!isSignedIn) {
    if (!publicPath) return <Redirect to="/login" />;
    return <Switch><Route path="/" component={LandingPage} /><Route path="/login" component={LoginPage} /><Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} /><Route component={LandingPage} /></Switch>;
  }

  if (location === '/login' || location.startsWith('/sign-in') || location.startsWith('/sign-up')) return <Redirect to={role === 'teacher' ? '/teacher' : '/'} />;
  if (role === 'teacher' && !['/teacher', '/profile'].includes(location)) return <Redirect to="/teacher" />;
  if (role === 'student' && location === '/teacher') return <Redirect to="/" />;

  return (
    <ErrorBoundary resetKey={location}>
      <Shell>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/planner" component={PlannerPage} />
          <Route path="/careers" component={CareersPage} />
          <Route path="/roadmap" component={RoadmapPage} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/ask" component={AskPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/opportunities" component={OpportunitiesPage} />
          <Route path="/community" component={CommunityPage} />
          <Route path="/refreshment" component={RefreshmentPage} />
          <Route path="/teacher" component={TeacherPage} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </ErrorBoundary>
  );
}

function ClerkApp() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to continue your EduVerse journey' } },
        signUp: { start: { title: 'Create your EduVerse account', subtitle: 'Choose a role and start your next chapter' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <TooltipProvider><WouterRouter base={basePath}><ClerkApp /></WouterRouter></TooltipProvider>;
}

export default App;