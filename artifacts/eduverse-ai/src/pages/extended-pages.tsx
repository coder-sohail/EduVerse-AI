import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, Award, Bookmark, BriefcaseBusiness, CalendarDays, Check, ChevronRight, CircleHelp,
  Clock3, FileText, Heart, MapPin, MessageCircle, Plus, Search,
  Send, Sparkles, Trophy, Users, X, Zap
} from 'lucide-react';
import {
  getListCommunityPostsQueryKey, getListOpportunitiesQueryKey,
  useCreateCommunityPost, useGetTeacherDashboard, useListCommunityPosts,
  useListOpportunities, useListRefreshmentQuizzes, useToggleCommunityPostLike,
  useToggleOpportunitySave
} from '@workspace/api-client-react';
import type { CommunityPost, Opportunity, Quiz, TeacherDashboard } from '@workspace/api-client-react';

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

function PageTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 animate-rise sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="font-serif text-4xl font-semibold tracking-[-.03em] text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
      {action}
    </div>
  );
}

function Button({ children, variant = 'primary', className, onClick, type = 'button', disabled, testId }: {
  children: ReactNode; variant?: 'primary' | 'soft' | 'ghost'; className?: string;
  onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; testId?: string;
}) {
  return (
    <button data-testid={testId} type={type} onClick={onClick} disabled={disabled}
      className={cx('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg',
        variant === 'soft' && 'bg-accent/25 text-primary hover:-translate-y-0.5 hover:bg-accent/40',
        variant === 'ghost' && 'text-muted-foreground hover:bg-muted hover:text-foreground', className)}>
      {children}
    </button>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div data-testid="status-loading" aria-label="Loading" className={cx('skeleton rounded-2xl', className)} />;
}

function QueryState({ loading, error, empty, onRetry, children }: { loading: boolean; error: boolean; empty?: boolean; onRetry?: () => void; children: ReactNode }) {
  if (loading) return <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-40 w-full" /><Skeleton className="h-32 w-full" /></div>;
  if (error) return <div data-testid="status-error" className="rounded-2xl border border-destructive/25 bg-destructive/10 p-6 text-sm text-destructive"><p className="font-bold">This view took a pause.</p><p className="mt-1 opacity-80">Try again in a moment. Your work is still safe.</p>{onRetry && <button data-testid="button-retry" onClick={onRetry} className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-extrabold hover:bg-destructive/20">Try again</button>}</div>;
  if (empty) return <div data-testid="status-empty" className="ink-grid rounded-2xl border border-dashed border-border p-12 text-center"><Sparkles className="mx-auto mb-3 h-6 w-6 text-accent-foreground" /><p className="font-serif text-xl font-bold">Nothing here yet</p><p className="mt-2 text-sm text-muted-foreground">Check back soon for a fresh next step.</p></div>;
  return <>{children}</>;
}

const kindLabels: Record<string, string> = {
  scholarship: 'Scholarship', internship: 'Internship', hackathon: 'Hackathon', event: 'Event', job: 'Job'
};
const kindIcons: Record<string, typeof Award> = {
  scholarship: Award, internship: BriefcaseBusiness, hackathon: Trophy, event: CalendarDays, job: FileText
};

function OpportunityCard({ opportunity, onSave, saving }: { opportunity: Opportunity; onSave: (item: Opportunity) => void; saving: boolean }) {
  const Icon = kindIcons[opportunity.kind] || Award;
  return (
    <article data-testid={`card-opportunity-${opportunity.id}`} className={cx('group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg', opportunity.featured && 'ring-1 ring-accent/60')}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] opacity-15" style={{ backgroundColor: opportunity.accent }} />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl text-primary" style={{ backgroundColor: `${opportunity.accent}30` }}><Icon className="h-5 w-5" /></div>
          <div className="flex items-center gap-2">
            {opportunity.featured && <span className="rounded-full bg-accent/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">Featured</span>}
            <button data-testid={`button-save-opportunity-${opportunity.id}`} aria-label={opportunity.saved ? 'Remove saved opportunity' : 'Save opportunity'} onClick={() => onSave(opportunity)} disabled={saving} className={cx('rounded-lg p-2 hover:bg-muted', opportunity.saved ? 'text-primary' : 'text-muted-foreground')}><Bookmark className={cx('h-4 w-4', opportunity.saved && 'fill-current')} /></button>
          </div>
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-muted-foreground">{kindLabels[opportunity.kind]}</p>
        <h2 className="mt-1 font-serif text-2xl font-bold leading-tight">{opportunity.title}</h2>
        <p className="mt-2 text-sm font-semibold text-primary">{opportunity.organization}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{opportunity.description}</p>
        <div className="mt-5 grid gap-2 border-t border-border/70 pt-4 text-xs font-semibold text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-accent-foreground" />Closes {opportunity.deadline}</span>
          <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-accent-foreground" />{opportunity.location}</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Good to know:</strong> {opportunity.eligibility}</p>
      </div>
    </article>
  );
}

export function OpportunitiesPage() {
  const [kind, setKind] = useState<'all' | 'scholarship' | 'internship' | 'hackathon' | 'event' | 'job'>('all');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();
  const opportunities = useListOpportunities({ type: kind, search: search || undefined });
  const save = useToggleOpportunitySave();
  const list = useMemo(() => (opportunities.data || []).filter((item) => !savedOnly || item.saved), [opportunities.data, savedOnly]);
  const saveOpportunity = (item: Opportunity) => {
    setFeedback('');
    save.mutate({ id: item.id, data: { saved: !item.saved } }, {
      onSuccess: (updated) => {
        setFeedback(updated.saved ? 'Saved to your shortlist.' : 'Removed from your shortlist.');
        queryClient.setQueryData(getListOpportunitiesQueryKey({ type: kind, search: search || undefined }), (old: Opportunity[] | undefined) => old?.map((entry) => entry.id === updated.id ? updated : entry));
      },
      onError: () => setFeedback('Could not update your shortlist. Try again.')
    });
  };
  return <><PageTitle eyebrow="Open doors" title="Find your next opportunity." detail="A considered shortlist of ways to learn, earn, and meet people doing work you care about." action={<div className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground"><p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">Your shortlist</p><p className="mt-1 font-serif text-2xl font-bold">{(opportunities.data || []).filter((item) => item.saved).length} saved</p></div>} /><section className="mb-7 rounded-2xl border border-border bg-card p-3 sm:p-4"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input data-testid="input-search-opportunities" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles, organizations, or topics..." className="h-11 w-full rounded-xl bg-muted/60 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" /></label><button data-testid="button-toggle-saved-opportunities" onClick={() => setSavedOnly((value) => !value)} className={cx('inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold', savedOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}><Bookmark className={cx('h-4 w-4', savedOnly && 'fill-current')} /> Saved only</button></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{(['all', 'scholarship', 'internship', 'hackathon', 'event', 'job'] as const).map((item) => <button data-testid={`button-opportunity-kind-${item}`} key={item} onClick={() => setKind(item)} className={cx('whitespace-nowrap rounded-full px-3 py-2 text-xs font-extrabold', kind === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}>{item === 'all' ? 'Everything' : kindLabels[item]}</button>)}</div></section>{feedback && <p data-testid="status-opportunity-feedback" className="mb-5 text-sm font-bold text-primary">{feedback}</p>}<QueryState loading={opportunities.isLoading} error={opportunities.isError} onRetry={() => opportunities.refetch()} empty={!list.length}><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{list.map((item) => <OpportunityCard key={item.id} opportunity={item} onSave={saveOpportunity} saving={save.isPending} />)}</div></QueryState></>;
}

function PostCard({ post, onLike, liking }: { post: CommunityPost; onLike: (post: CommunityPost) => void; liking: boolean }) {
  return <article data-testid={`card-community-post-${post.id}`} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/35 text-xs font-extrabold text-primary">{post.initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p data-testid={`text-post-author-${post.id}`} className="text-sm font-bold">{post.author}</p><span className="text-xs text-muted-foreground">in {post.group}</span></div><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{post.time}</p></div><span aria-hidden className="px-2 text-lg leading-none text-muted-foreground">···</span></div><h2 className="mt-5 font-serif text-2xl font-bold">{post.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{post.body}</p><div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4"><button data-testid={`button-like-post-${post.id}`} onClick={() => onLike(post)} disabled={liking} className={cx('inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold hover:bg-muted', post.liked ? 'text-destructive' : 'text-muted-foreground')}><Heart className={cx('h-4 w-4', post.liked && 'fill-current')} /> {post.likes}</button><span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground"><MessageCircle className="h-4 w-4" /> {post.replies} replies</span></div></article>;
}

export function CommunityPage() {
  const [group, setGroup] = useState('All circles');
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({ title: '', body: '', group: 'Study circle' });
  const queryClient = useQueryClient();
  const posts = useListCommunityPosts();
  const create = useCreateCommunityPost();
  const like = useToggleCommunityPostLike();
  const list = useMemo(() => group === 'All circles' ? (posts.data || []) : (posts.data || []).filter((post) => post.group === group), [posts.data, group]);
  const groups = ['All circles', ...Array.from(new Set((posts.data || []).map((post) => post.group)))];
  const likePost = (post: CommunityPost) => like.mutate({ id: post.id, data: { liked: !post.liked } }, {
    onSuccess: (updated) => queryClient.setQueryData(getListCommunityPostsQueryKey(), (old: CommunityPost[] | undefined) => old?.map((entry) => entry.id === updated.id ? updated : entry)),
    onError: () => setFeedback('Could not update that reaction. Try again.')
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    create.mutate({ data: form }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', body: '', group: 'Study circle' }); setFeedback('Your post is live in the community.'); queryClient.invalidateQueries({ queryKey: getListCommunityPostsQueryKey() }); },
      onError: () => setFeedback('Your post could not be published. Try again.')
    });
  };
  return <><PageTitle eyebrow="Study together" title="A room for the in-between." detail="Share the question you are carrying, trade a useful resource, and find peers who are figuring it out too." action={<Button testId="button-create-community-post" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Start a post</Button>} /><div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1"><Users className="h-4 w-4 shrink-0 text-muted-foreground" />{groups.map((item) => <button data-testid={`button-community-group-${item.replaceAll(' ', '-').toLowerCase()}`} key={item} onClick={() => setGroup(item)} className={cx('whitespace-nowrap rounded-full px-3 py-2 text-xs font-extrabold', group === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}>{item}</button>)}</div>{feedback && <p data-testid="status-community-feedback" className="mb-5 text-sm font-bold text-primary">{feedback}</p>}<QueryState loading={posts.isLoading} error={posts.isError} onRetry={() => posts.refetch()} empty={!list.length}><div className="grid gap-5 lg:grid-cols-[1fr_.72fr]"><div className="space-y-4">{list.map((post) => <PostCard key={post.id} post={post} onLike={likePost} liking={like.isPending} />)}</div><aside className="hidden h-fit rounded-2xl bg-primary p-6 text-primary-foreground lg:block"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-primary-foreground/60">The community note</p><h2 className="mt-3 font-serif text-3xl font-bold leading-tight">You do not have to learn alone.</h2><p className="mt-3 text-sm leading-6 text-primary-foreground/70">Ask the specific question. Someone a few steps ahead may have the exact shortcut you need.</p><div className="mt-6 flex items-center gap-2 text-xs font-bold text-accent"><Sparkles className="h-4 w-4" /> Thoughtful beats loud</div></aside></div></QueryState>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 p-5"><form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">New conversation</p><h2 className="mt-1 font-serif text-3xl font-bold">Put a thought out there.</h2></div><button data-testid="button-close-community-dialog" type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div><div className="space-y-4"><label className="block text-sm font-bold">Title<input data-testid="input-community-title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What are you thinking through?" className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label><label className="block text-sm font-bold">Circle<select data-testid="select-community-group" value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"><option>Study circle</option>{groups.filter((item) => item !== 'All circles').map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-sm font-bold">Your post<textarea data-testid="input-community-body" required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Share enough context for a useful reply..." rows={5} className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm font-normal outline-none focus:border-primary" /></label></div><Button type="submit" testId="button-submit-community-post" className="mt-6 w-full" disabled={create.isPending}>{create.isPending ? 'Publishing...' : <><Send className="h-4 w-4" /> Publish post</>}</Button></form></div>}</>;
}

function QuizCard({ quiz, onStart }: { quiz: Quiz; onStart: (quiz: Quiz) => void }) {
  return <button data-testid={`card-refreshment-quiz-${quiz.id}`} onClick={() => onStart(quiz)} className="group rounded-2xl border border-border bg-card p-6 text-left hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"><div className="mb-6 flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl text-primary" style={{ backgroundColor: `${quiz.accent}35` }}><Zap className="h-5 w-5" /></div><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{quiz.progress}% complete</span></div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-muted-foreground">{quiz.category}</p><h2 className="mt-1 font-serif text-2xl font-bold">{quiz.title}</h2><div className="mt-5 flex items-center justify-between text-xs font-bold text-muted-foreground"><span>{quiz.questions} questions · {quiz.xp} XP</span><span className="inline-flex items-center gap-1 text-primary">Try it <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${quiz.progress}%`, backgroundColor: quiz.accent }} /></div></button>;
}

export function RefreshmentPage() {
  const quizzes = useListRefreshmentQuizzes();
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [started, setStarted] = useState(false);
  return <><PageTitle eyebrow="A lighter rep" title="Refresh your thinking." detail="Short quizzes and small challenges for the moments when you want to keep the thread without starting a whole study session." action={<div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"><Trophy className="h-5 w-5 text-accent-foreground" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today’s energy</p><p className="font-bold">12 XP ready</p></div></div>} /><div className="mb-7 grid gap-4 md:grid-cols-[1.2fr_.8fr]"><section className="rounded-2xl bg-accent/25 p-6"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-primary">The two-minute rule</p><h2 className="mt-2 font-serif text-3xl font-bold">Small counts.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-primary/75">Pick one prompt, answer without overthinking, and leave with a little more momentum than you arrived with.</p></section><section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Clock3 className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Typical session</p><p className="font-serif text-2xl font-bold">4–8 minutes</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">A quick reset is still real progress.</p></section></div><QueryState loading={quizzes.isLoading} error={quizzes.isError} onRetry={() => quizzes.refetch()} empty={!quizzes.data?.length}><div className="grid gap-4 md:grid-cols-2">{(quizzes.data || []).map((quiz) => <QuizCard key={quiz.id} quiz={quiz} onStart={(item) => { setSelected(item); setStarted(false); }} />)}</div></QueryState>{selected && <div className="fixed inset-0 z-50 grid place-items-center bg-primary/30 p-5" onClick={() => setSelected(null)}><div onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-card p-7 shadow-2xl sm:p-9"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">{selected.category}</p><h2 data-testid="text-selected-quiz" className="mt-2 font-serif text-3xl font-bold">{selected.title}</h2></div><button data-testid="button-close-quiz" onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>{!started ? <><p className="mt-5 text-sm leading-7 text-muted-foreground">A focused set of {selected.questions} questions. Take your best first answer; the point is to notice what you know.</p><div className="mt-6 rounded-2xl bg-muted/70 p-4 text-sm font-semibold"><CircleHelp className="mb-2 h-5 w-5 text-primary" />You will earn up to {selected.xp} XP for completing this refreshment.</div><Button testId="button-start-quiz" onClick={() => setStarted(true)} className="mt-6 w-full">Start refreshment <ArrowRight className="h-4 w-4" /></Button></> : <div className="mt-6 rounded-2xl bg-accent/25 p-6 text-center"><Check className="mx-auto h-7 w-7 text-primary" /><h3 className="mt-3 font-serif text-2xl font-bold">You are in.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The quiz player is ready for your next round of answers.</p><Button testId="button-finish-quiz" onClick={() => setSelected(null)} variant="soft" className="mt-5">Finish preview</Button></div>}</div></div>}</>;
}

function TeacherStat({ label, value, detail, accent = false }: { label: string; value: string | number; detail: string; accent?: boolean }) {
  return <div className={cx('rounded-2xl border border-border p-5', accent ? 'bg-primary text-primary-foreground' : 'bg-card')}><p className={cx('text-[10px] font-extrabold uppercase tracking-[.16em]', accent ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{label}</p><p className="mt-3 font-serif text-4xl font-bold">{value}</p><p className={cx('mt-1 text-xs', accent ? 'text-primary-foreground/65' : 'text-muted-foreground')}>{detail}</p></div>;
}

export function TeacherPage() {
  const dashboard = useGetTeacherDashboard();
  const [classId, setClassId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'needs_review'>('all');
  const data = dashboard.data as TeacherDashboard | undefined;
  const activeClass = data?.classGroups.find((item) => item.id === classId);
  const submissions = useMemo(() => (data?.recentSubmissions || []).filter((submission) => filter === 'all' || submission.status === 'needs_review'), [data?.recentSubmissions, filter]);
  return <><PageTitle eyebrow="Teacher portal" title={`Keep the room moving${data?.teacherName ? `, ${data.teacherName.split(' ')[0]}` : ''}.`} detail="A clear view of class momentum, student work, and the small interventions that make progress visible." /><QueryState loading={dashboard.isLoading} error={dashboard.isError} onRetry={() => dashboard.refetch()} empty={!data}><>{data && <><section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><TeacherStat label="Classes" value={data.classes} detail="active learning rooms" accent /><TeacherStat label="Active students" value={data.activeStudents} detail="learning this week" /><TeacherStat label="To review" value={data.assignmentsToReview} detail="submissions waiting" /><TeacherStat label="Average progress" value={`${data.averageProgress}%`} detail="across your classes" /></section><section className="mb-7 grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div className="rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">Your classrooms</p><h2 className="mt-1 font-serif text-2xl font-bold">Where attention is landing</h2></div><Users className="h-5 w-5 text-accent-foreground" /></div><div className="space-y-3">{data.classGroups.map((item) => <button data-testid={`button-teacher-class-${item.id}`} key={item.id} onClick={() => setClassId(classId === item.id ? null : item.id)} className={cx('w-full rounded-xl border p-4 text-left transition-colors hover:border-primary/40', classId === item.id ? 'border-primary bg-accent/20' : 'border-border/70')}><div className="flex items-center justify-between gap-3"><div><p className="font-bold">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.subject} · {item.students} students</p></div><ChevronRight className={cx('h-4 w-4 text-muted-foreground transition-transform', classId === item.id && 'rotate-90 text-primary')} /></div><div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} /></div><span className="text-xs font-bold">{item.progress}%</span></div><p className="mt-2 text-xs text-muted-foreground">Next: {item.next}</p></button>)}</div>{activeClass && <div data-testid="status-selected-class" className="mt-4 rounded-xl bg-muted/60 p-4 text-sm"><strong>{activeClass.name}</strong> is selected. The next class focus is <strong>{activeClass.next}</strong>.</div>}</div><div className="rounded-2xl bg-primary p-6 text-primary-foreground"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary-foreground/60">A useful read</p><h2 className="mt-3 font-serif text-3xl font-bold leading-tight">Progress is a conversation, not a score.</h2><p className="mt-3 text-sm leading-6 text-primary-foreground/70">Use submissions as signals: where to encourage, where to clarify, and where to let a student take the next brave step.</p><div className="mt-8 flex items-center gap-2 text-xs font-bold text-accent"><Sparkles className="h-4 w-4" /> EduVerse teacher view</div></div></section><section className="rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-muted-foreground">Recent submissions</p><h2 className="mt-1 font-serif text-2xl font-bold">A gentle review queue</h2></div><div className="flex gap-2"><button data-testid="button-submissions-all" onClick={() => setFilter('all')} className={cx('rounded-lg px-3 py-2 text-xs font-bold', filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>All work</button><button data-testid="button-submissions-review" onClick={() => setFilter('needs_review')} className={cx('rounded-lg px-3 py-2 text-xs font-bold', filter === 'needs_review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Needs review</button></div></div>{submissions.length ? <div className="divide-y divide-border">{submissions.map((submission) => <div data-testid={`row-submission-${submission.id}`} key={submission.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/30 text-xs font-extrabold text-primary">{submission.student.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="font-bold">{submission.student}</p><p className="mt-1 text-xs text-muted-foreground">{submission.assignment} · {submission.className}</p></div><span className="text-sm font-bold">{submission.score}/100</span><span className={cx('rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider', submission.status === 'needs_review' ? 'bg-accent/30 text-primary' : submission.status === 'reviewed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>{submission.status.replace('_', ' ')}</span><span className="text-xs text-muted-foreground">{submission.time}</span></div>)}</div> : <div data-testid="status-empty-submissions" className="rounded-xl bg-muted/60 p-6 text-center text-sm text-muted-foreground">No submissions match this view.</div>}</section></>}</></QueryState></>;
}