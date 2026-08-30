import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, BookOpen, GraduationCap, Loader2, School, Sparkles } from 'lucide-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { CareersPage, DashboardPage, LearnPage, PlannerPage, ProfilePage, RoadmapPage, Shell, SkillsPage, AskPage } from '@/components/eduverse-app';
import { CommunityPage, OpportunitiesPage, RefreshmentPage, TeacherPage } from '@/pages/extended-pages';
import { getEduVerseRole, setEduVerseRole, type EduVerseRole } from '@/lib/auth';
import { getStoredRole, saveCurrentProfile, supabase } from '@/lib/supabase';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

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

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const isSignUp = mode === 'sign-up';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setPending(true);
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { role: getEduVerseRole() } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (isSignUp && !result.data.session) {
      setMessage('Check your email to confirm your account, then return here to sign in.');
      return;
    }
    if (result.data.session) {
      const savedRole = await getStoredRole();
      if (savedRole) {
        setEduVerseRole(savedRole);
      } else {
        await saveCurrentProfile(getEduVerseRole());
      }
    }
    setLocation(getEduVerseRole() === 'teacher' ? '/teacher' : '/');
  };

  const googleLogin = async () => {
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${basePath}/` },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl sm:p-9">
        <Link href="/login" className="mb-8 inline-flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary"><GraduationCap className="h-5 w-5" /></span><span className="font-serif text-2xl font-bold">EduVerse</span></Link>
        <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-muted-foreground">{getEduVerseRole()} account</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">{isSignUp ? 'Create your account.' : 'Welcome back.'}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignUp ? 'Start your next chapter with a workspace shaped around your role.' : 'Sign in to continue your EduVerse journey.'}</p>
        <button type="button" data-testid="button-google-auth" onClick={googleLogin} className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 text-sm font-bold hover:bg-muted">Continue with Google</button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold">Email<input data-testid="input-auth-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label>
          <label className="block text-sm font-bold">Password<input data-testid="input-auth-password" type="password" required minLength={6} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label>
          {error && <p data-testid="status-auth-error" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {message && <p data-testid="status-auth-message" className="rounded-xl bg-accent/25 p-3 text-sm text-primary">{message}</p>}
          <button type="submit" data-testid="button-submit-auth" disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{isSignUp ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">{isSignUp ? 'Already have an account?' : 'Don’t have an account?'} <button type="button" onClick={() => setLocation(isSignUp ? '/sign-in' : '/sign-up')} className="font-bold text-primary hover:underline">{isSignUp ? 'Sign in' : 'Sign up'}</button></p>
      </div>
    </main>
  );
}

function AppRouter({ sessionReady, signedIn }: { sessionReady: boolean; signedIn: boolean }) {
  const [location] = useLocation();
  const role = getEduVerseRole();
  const publicPath = useMemo(() => location === '/' || location === '/login' || location.startsWith('/sign-in') || location.startsWith('/sign-up'), [location]);

  if (!sessionReady) return <AuthLoading />;
  if (!signedIn) {
    if (!publicPath) return <Redirect to="/login" />;
    return <Switch><Route path="/" component={LandingPage} /><Route path="/login" component={LoginPage} /><Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} /><Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} /><Route component={LandingPage} /></Switch>;
  }
  if (location === '/login' || location.startsWith('/sign-in') || location.startsWith('/sign-up')) return <Redirect to={role === 'teacher' ? '/teacher' : '/'} />;
  if (role === 'teacher' && !['/teacher', '/profile'].includes(location)) return <Redirect to="/teacher" />;
  if (role === 'student' && location === '/teacher') return <Redirect to="/" />;
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={DashboardPage} /><Route path="/learn" component={LearnPage} /><Route path="/planner" component={PlannerPage} /><Route path="/careers" component={CareersPage} /><Route path="/roadmap" component={RoadmapPage} /><Route path="/skills" component={SkillsPage} /><Route path="/ask" component={AskPage} /><Route path="/profile" component={ProfilePage} /><Route path="/opportunities" component={OpportunitiesPage} /><Route path="/community" component={CommunityPage} /><Route path="/refreshment" component={RefreshmentPage} /><Route path="/teacher" component={TeacherPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  const [sessionReady, setSessionReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setAccountError(error.message);
      } else if (data.session) {
        try {
          const savedRole = await getStoredRole();
          if (savedRole) setEduVerseRole(savedRole);
        } catch (profileError) {
          setAccountError(profileError instanceof Error ? profileError.message : 'Unable to load your profile.');
        }
      }
      setSignedIn(Boolean(data.session));
      setSessionReady(true);
    }).catch((error: unknown) => {
      if (!mounted) return;
      setAccountError(error instanceof Error ? error.message : 'Unable to load your account.');
      setSessionReady(true);
    });
    setAuthTokenGetter(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setSessionReady(true);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  if (accountError) {
    return <main className="grid min-h-[100dvh] place-items-center bg-background px-6"><div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-6 text-center"><h1 className="font-serif text-2xl font-bold">Profile setup needed</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{accountError}</p><a href={`${basePath}/login`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Return to login</a></div></main>;
  }
  return <TooltipProvider><WouterRouter base={basePath}><QueryClientProvider client={queryClient}><AppRouter sessionReady={sessionReady} signedIn={signedIn} /><Toaster /></QueryClientProvider></WouterRouter></TooltipProvider>;
}

export default App;