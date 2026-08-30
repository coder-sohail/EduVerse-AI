import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import {
  CreateStudyTaskBody,
  CreateCommunityPostBody,
  ListOpportunitiesQueryParams,
  ListCareersQueryParams,
  ListLearningResourcesQueryParams,
  ListStudyTasksQueryParams,
  ToggleCommunityPostLikeBody,
  ToggleOpportunitySaveBody,
  SendAiChatMessageBody,
  ToggleResourceBookmarkBody,
  ToggleResourceBookmarkParams,
  UpdateRoadmapMilestoneBody,
  UpdateRoadmapMilestoneParams,
  UpdateStudentProfileBody,
  UpdateStudyTaskBody,
  UpdateStudyTaskParams,
} from "@workspace/api-zod";

type TaskStatus = "todo" | "in_progress" | "completed";
type MilestoneStatus = "completed" | "active" | "locked";

const profile = {
  id: "student-maya",
  name: "Maya",
  educationLevel: "undergraduate" as const,
  school: "Kensington Institute of Technology",
  classYear: "2nd year",
  stream: "Computer Science",
  subjects: ["Data Structures", "Web Development", "Linear Algebra"],
  interests: ["AI & ML", "Design", "Building products"],
  careerGoal: "AI / ML Engineer",
  weeklyHours: 12,
  avatarInitials: "MC",
};

const resources = [
  {
    id: "resource-python-foundations",
    title: "Python foundations for machine learning",
    subject: "Python",
    type: "course" as const,
    duration: "4h 20m",
    description: "Build a confident Python base with the patterns ML engineers use most.",
    level: "beginner" as const,
    progress: 68,
    bookmarked: true,
    accent: "coral",
  },
  {
    id: "resource-linear-algebra",
    title: "Linear algebra, visualized",
    subject: "Mathematics",
    type: "video" as const,
    duration: "38 min",
    description: "See vectors, matrices, and transformations move before you calculate them.",
    level: "intermediate" as const,
    progress: 24,
    bookmarked: false,
    accent: "violet",
  },
  {
    id: "resource-ml-projects",
    title: "5 portfolio projects that teach ML",
    subject: "AI & ML",
    type: "article" as const,
    duration: "12 min",
    description: "A practical sequence of projects that turns concepts into proof of work.",
    level: "intermediate" as const,
    progress: 0,
    bookmarked: false,
    accent: "mint",
  },
  {
    id: "resource-sql-practice",
    title: "SQL patterns: practice set 01",
    subject: "Data",
    type: "practice" as const,
    duration: "20 questions",
    description: "Sharpen joins, grouping, and subqueries with instant feedback.",
    level: "beginner" as const,
    progress: 42,
    bookmarked: true,
    accent: "blue",
  },
  {
    id: "resource-neural-networks",
    title: "Neural networks from first principles",
    subject: "AI & ML",
    type: "course" as const,
    duration: "2h 45m",
    description: "Understand what is happening under the hood, one layer at a time.",
    level: "advanced" as const,
    progress: 0,
    bookmarked: false,
    accent: "gold",
  },
];

const tasks = [
  {
    id: "task-python",
    title: "Finish Python list comprehensions",
    subject: "Python",
    date: "Today",
    duration: 45,
    status: "in_progress" as TaskStatus,
    priority: "high" as const,
    kind: "Learn",
  },
  {
    id: "task-linear",
    title: "Review eigenvectors & eigenvalues",
    subject: "Linear Algebra",
    date: "Today",
    duration: 35,
    status: "todo" as TaskStatus,
    priority: "medium" as const,
    kind: "Review",
  },
  {
    id: "task-project",
    title: "Sketch image classifier project",
    subject: "AI / ML",
    date: "Tomorrow",
    duration: 60,
    status: "todo" as TaskStatus,
    priority: "high" as const,
    kind: "Build",
  },
  {
    id: "task-sql",
    title: "Complete SQL practice set",
    subject: "Data",
    date: "Wed, Aug 31",
    duration: 30,
    status: "completed" as TaskStatus,
    priority: "low" as const,
    kind: "Practice",
  },
  {
    id: "task-reading",
    title: "Read: bias in training data",
    subject: "AI / ML",
    date: "Thu, Sep 1",
    duration: 25,
    status: "todo" as TaskStatus,
    priority: "medium" as const,
    kind: "Read",
  },
];

const careers = [
  {
    id: "career-ml",
    title: "AI / ML Engineer",
    category: "Build intelligent systems",
    match: 92,
    description: "Design models and products that learn from data to solve real-world problems.",
    whyItFits: "Your interest in building products and strong foundation in math align beautifully with this path.",
    skills: ["Python", "Statistics", "Machine Learning", "SQL", "Communication"],
    subjects: ["Linear Algebra", "Probability", "Data Structures"],
    pathway: ["Strengthen foundations", "Build 3 portfolio projects", "Learn model deployment", "Apply for internships"],
    color: "coral",
  },
  {
    id: "career-data",
    title: "Data Scientist",
    category: "Turn questions into insight",
    match: 84,
    description: "Use experiments, statistics, and storytelling to help teams make better decisions.",
    whyItFits: "You enjoy finding patterns and have a natural curiosity about how products behave.",
    skills: ["Python", "Statistics", "SQL", "Data Visualization", "Communication"],
    subjects: ["Probability", "Statistics", "Database Systems"],
    pathway: ["Master analysis tools", "Practice experimentation", "Publish case studies", "Find an analyst role"],
    color: "violet",
  },
  {
    id: "career-product",
    title: "Product Engineer",
    category: "Make useful things",
    match: 78,
    description: "Combine engineering, user empathy, and product thinking to ship experiences people love.",
    whyItFits: "Your design interest and habit of building products suggest a strong maker mindset.",
    skills: ["JavaScript", "React", "System Design", "User Research", "Communication"],
    subjects: ["Web Development", "Data Structures", "Human Computer Interaction"],
    pathway: ["Ship small products", "Learn systems thinking", "Collaborate with designers", "Grow through internships"],
    color: "mint",
  },
];

const milestones = [
  {
    id: "milestone-foundations",
    title: "Strengthen the foundations",
    description: "Python, linear algebra, statistics, and clean coding habits.",
    status: "completed" as MilestoneStatus,
    duration: "4 weeks",
    order: 1,
  },
  {
    id: "milestone-projects",
    title: "Build your first ML projects",
    description: "Turn concepts into two small projects you can explain end-to-end.",
    status: "active" as MilestoneStatus,
    duration: "6 weeks",
    order: 2,
  },
  {
    id: "milestone-deployment",
    title: "Learn to ship models",
    description: "Move from notebooks to APIs, evaluation, and responsible deployment.",
    status: "locked" as MilestoneStatus,
    duration: "5 weeks",
    order: 3,
  },
  {
    id: "milestone-opportunity",
    title: "Prepare for your first opportunity",
    description: "Polish your portfolio, practice interviews, and find aligned teams.",
    status: "locked" as MilestoneStatus,
    duration: "3 weeks",
    order: 4,
  },
];

const skillGaps = [
  {
    id: "skill-python",
    name: "Python",
    level: 72,
    target: 90,
    status: "developing" as const,
    priority: "high" as const,
    recommendation: "Complete the Python foundations course and ship one data-cleaning script.",
  },
  {
    id: "skill-statistics",
    name: "Statistics",
    level: 38,
    target: 82,
    status: "missing" as const,
    priority: "high" as const,
    recommendation: "Start with distributions, hypothesis testing, and interpreting model metrics.",
  },
  {
    id: "skill-sql",
    name: "SQL",
    level: 64,
    target: 78,
    status: "developing" as const,
    priority: "medium" as const,
    recommendation: "Practice joins and aggregations against a small product dataset.",
  },
  {
    id: "skill-math",
    name: "Mathematics",
    level: 86,
    target: 80,
    status: "mastered" as const,
    priority: "low" as const,
    recommendation: "Keep your edge by connecting each topic to a model you build.",
  },
  {
    id: "skill-communication",
    name: "Communication",
    level: 76,
    target: 84,
    status: "developing" as const,
    priority: "medium" as const,
    recommendation: "Write a short project readme after each build to practice clarity.",
  },
];

const activity = [
  { id: "activity-1", type: "complete", title: "Completed SQL practice set", detail: "+40 XP · 18/20 correct", time: "Yesterday" },
  { id: "activity-2", type: "career", title: "Explored Data Scientist", detail: "84% match · Saved to your paths", time: "2 days ago" },
  { id: "activity-3", type: "learn", title: "Started Python foundations", detail: "68% complete · Keep going", time: "3 days ago" },
];

const chatReplies = [
  {
    match: ["eigen", "vector", "matrix"],
    message: "Think of an eigenvector as a direction that a transformation leaves pointing the same way. The transformation may stretch or shrink it, but it does not turn it. That scale factor is the eigenvalue. For ML, this matters because eigenvectors help us find the most meaningful directions in data.",
    suggestions: ["Show me a visual example", "Quiz me on this", "Connect it to PCA"],
  },
  {
    match: ["python", "list", "code"],
    message: "A list comprehension is a compact way to create a list from an existing iterable. Start with the readable version first: `squares = []`, then loop and append. Once that feels natural, compress it to `[x * x for x in numbers]`. The pattern is: expression, for-loop, optional condition.",
    suggestions: ["Give me a practice problem", "Explain the syntax", "Quiz me"],
  },
  {
    match: ["career", "job", "roadmap"],
    message: "Based on your current profile, AI / ML Engineer is a strong direction because it combines your interest in building products with your math foundation. Your highest-leverage next step is to close the statistics gap while finishing one small end-to-end project.",
    suggestions: ["What project should I build?", "Show my skill gaps", "Plan my week"],
  },
];

const opportunities = [
  {
    id: "opportunity-ml-internship",
    title: "Machine Learning Intern",
    kind: "internship" as const,
    organization: "Northstar Labs",
    deadline: "in 12 days",
    location: "Remote · India",
    description: "Work with a small applied ML team on evaluation, data quality, and model experiences.",
    eligibility: "Undergraduate students with Python fundamentals",
    featured: true,
    saved: false,
    accent: "coral",
  },
  {
    id: "opportunity-women-tech",
    title: "Women in Tech Scholars",
    kind: "scholarship" as const,
    organization: "Future Forward Foundation",
    deadline: "Sep 14",
    location: "India",
    description: "A scholarship and mentorship programme for students building a future in technology.",
    eligibility: "Students in years 1–3 with demonstrated financial need",
    featured: true,
    saved: true,
    accent: "gold",
  },
  {
    id: "opportunity-build-ai",
    title: "Build with AI Weekend",
    kind: "hackathon" as const,
    organization: "Open Source Club",
    deadline: "Sep 02",
    location: "Online · 48 hours",
    description: "Make something useful with AI, learn from mentors, and leave with a project to share.",
    eligibility: "Open to all students and first-time builders",
    featured: false,
    saved: false,
    accent: "violet",
  },
  {
    id: "opportunity-responsible-ai",
    title: "Responsible AI: from idea to impact",
    kind: "event" as const,
    organization: "The Learning Room",
    deadline: "Aug 31 · 6:30 PM",
    location: "Online · Live session",
    description: "A practical conversation on designing AI products people can trust.",
    eligibility: "Anyone curious about the future of technology",
    featured: false,
    saved: false,
    accent: "mint",
  },
  {
    id: "opportunity-junior-data",
    title: "Junior Data Analyst",
    kind: "job" as const,
    organization: "Good Company",
    deadline: "Rolling applications",
    location: "Bengaluru · Hybrid",
    description: "Join a product team where your first job is to ask better questions of the data.",
    eligibility: "Final-year students or recent graduates",
    featured: false,
    saved: false,
    accent: "blue",
  },
];

const communityPosts = [
  {
    id: "post-first-ml-project",
    author: "Arjun Mehta",
    initials: "AM",
    group: "AI builders",
    title: "What did you build for your first ML project?",
    body: "I’m choosing between a movie recommender and a small image classifier. Would love to hear what helped you learn the most, not just what looked impressive.",
    likes: 24,
    replies: 8,
    liked: false,
    time: "18 min ago",
  },
  {
    id: "post-linear-algebra",
    author: "Leena Shah",
    initials: "LS",
    group: "Study circle",
    title: "The eigenvector explanation that finally clicked",
    body: "Instead of memorising the formula, I pictured a rubber sheet being stretched. The directions that stay put are the ones we care about. Sharing in case someone else is stuck here too.",
    likes: 41,
    replies: 12,
    liked: true,
    time: "2 hours ago",
  },
  {
    id: "post-accountability",
    author: "Devika Rao",
    initials: "DR",
    group: "Quiet accountability",
    title: "A small win is still a win",
    body: "Finished my 30-minute session even though I didn’t feel like starting. Posting this so tomorrow-me remembers that momentum is built, not found.",
    likes: 63,
    replies: 5,
    liked: false,
    time: "Yesterday",
  },
];

const quizzes = [
  { id: "quiz-python", title: "Python patterns", category: "Build your fluency", questions: 10, xp: 80, progress: 40, accent: "coral" },
  { id: "quiz-data-thinking", title: "Think like a data scientist", category: "Reasoning practice", questions: 8, xp: 60, progress: 0, accent: "violet" },
  { id: "quiz-ai-basics", title: "AI foundations", category: "Quick refresh", questions: 12, xp: 100, progress: 75, accent: "mint" },
  { id: "quiz-sql", title: "SQL speed round", category: "Practice under pressure", questions: 15, xp: 120, progress: 100, accent: "gold" },
];

const teacherDashboard = {
  teacherName: "Dr. Priya Menon",
  classes: 4,
  activeStudents: 86,
  assignmentsToReview: 12,
  averageProgress: 71,
  classGroups: [
    { id: "class-cs2", name: "CS · Year 2", subject: "Data Structures", students: 28, progress: 76, next: "Trees & graphs · due Friday" },
    { id: "class-ai-lab", name: "AI Lab", subject: "Machine Learning", students: 22, progress: 68, next: "Model evaluation · due Monday" },
    { id: "class-web", name: "Product builders", subject: "Web Development", students: 19, progress: 82, next: "Ship v1 · due tomorrow" },
    { id: "class-foundations", name: "Foundations", subject: "Python", students: 17, progress: 59, next: "Functions · due next week" },
  ],
  recentSubmissions: [
    { id: "submission-1", student: "Maya Chen", assignment: "Image classifier sketch", className: "AI Lab", score: 88, status: "needs_review" as const, time: "12 min ago" },
    { id: "submission-2", student: "Kabir Singh", assignment: "Graph traversal exercise", className: "CS · Year 2", score: 94, status: "submitted" as const, time: "1 hour ago" },
    { id: "submission-3", student: "Sara Bose", assignment: "Build a responsive card", className: "Product builders", score: 76, status: "reviewed" as const, time: "Yesterday" },
  ],
};

const router: IRouter = Router();

function sendValidationError(res: Response, error: unknown) {
  res.status(400).json({ error: error instanceof Error ? error.message : "Invalid request" });
}

router.get("/student/profile", (_req, res) => res.json(profile));

router.patch("/student/profile", (req: Request, res: Response) => {
  const parsed = UpdateStudentProfileBody.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  Object.assign(profile, parsed.data);
  if (parsed.data.name) {
    profile.avatarInitials = parsed.data.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return res.json(profile);
});

router.get("/student/dashboard", (_req, res) => {
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const nextTask = tasks.find((task) => task.status !== "completed") ?? null;
  res.json({
    greeting: `Good morning, ${profile.name}.`,
    focus: "Build momentum with the foundations that unlock your ML path.",
    streak: 6,
    weeklyProgress: 68,
    completedTasks,
    totalTasks: tasks.length,
    nextTask,
    recommendedResources: resources.slice(0, 3),
    careerMatch: careers[0],
    skillGapCount: skillGaps.filter((skill) => skill.status !== "mastered").length,
    recentActivity: activity,
  });
});

router.get("/learning/resources", (req: Request, res: Response) => {
  const parsed = ListLearningResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const subject = parsed.data.subject?.toLowerCase();
  const type = parsed.data.type;
  return res.json(
    resources.filter((resource) => {
      const matchesSubject = !subject || resource.subject.toLowerCase().includes(subject);
      const matchesType = !type || resource.type === type;
      return matchesSubject && matchesType;
    }),
  );
});

router.patch("/learning/resources/:id/bookmark", (req: Request, res: Response) => {
  const params = ToggleResourceBookmarkParams.safeParse(req.params);
  const body = ToggleResourceBookmarkBody.safeParse(req.body);
  if (!params.success) return sendValidationError(res, params.error);
  if (!body.success) return sendValidationError(res, body.error);
  const resource = resources.find((item) => item.id === params.data.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  resource.bookmarked = body.data.bookmarked;
  return res.json(resource);
});

router.get("/study/tasks", (req: Request, res: Response) => {
  const parsed = ListStudyTasksQueryParams.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  if (parsed.data.range === "today") return res.json(tasks.filter((task) => task.date === "Today"));
  return res.json(tasks);
});

router.post("/study/tasks", (req: Request, res: Response) => {
  const parsed = CreateStudyTaskBody.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const task = {
    id: `task-${Date.now()}`,
    title: parsed.data.title,
    subject: parsed.data.subject,
    date: parsed.data.date,
    duration: parsed.data.duration,
    status: "todo" as TaskStatus,
    priority: parsed.data.priority ?? "medium",
    kind: "Learn",
  };
  tasks.unshift(task);
  return res.status(201).json(task);
});

router.patch("/study/tasks/:id", (req: Request, res: Response) => {
  const params = UpdateStudyTaskParams.safeParse(req.params);
  const body = UpdateStudyTaskBody.safeParse(req.body);
  if (!params.success) return sendValidationError(res, params.error);
  if (!body.success) return sendValidationError(res, body.error);
  const task = tasks.find((item) => item.id === params.data.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  Object.assign(task, body.data);
  return res.json(task);
});

router.get("/careers", (req: Request, res: Response) => {
  const parsed = ListCareersQueryParams.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const search = parsed.data.search?.toLowerCase();
  return res.json(
    search
      ? careers.filter((career) => `${career.title} ${career.category}`.toLowerCase().includes(search))
      : careers,
  );
});

router.get("/careers/:id", (req, res) => {
  const career = careers.find((item) => item.id === req.params.id);
  if (!career) return res.status(404).json({ error: "Career not found" });
  return res.json(career);
});

router.get("/roadmap", (_req, res) => {
  res.json({ career: careers[0], progress: 36, estimatedWeeks: 18, milestones });
});

router.patch("/roadmap/milestones/:id", (req: Request, res: Response) => {
  const params = UpdateRoadmapMilestoneParams.safeParse(req.params);
  const body = UpdateRoadmapMilestoneBody.safeParse(req.body);
  if (!params.success) return sendValidationError(res, params.error);
  if (!body.success) return sendValidationError(res, body.error);
  const milestone = milestones.find((item) => item.id === params.data.id);
  if (!milestone) return res.status(404).json({ error: "Milestone not found" });
  milestone.status = body.data.status;
  return res.json(milestone);
});

router.get("/skills/gaps", (_req, res) => {
  res.json({ career: careers[0].title, overall: 68, skills: skillGaps });
});

router.post("/ai/chat", (req: Request, res: Response) => {
  const parsed = SendAiChatMessageBody.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const input = parsed.data.message.toLowerCase();
  const reply = chatReplies.find((item) => item.match.some((term) => input.includes(term))) ?? {
    message: "That is a thoughtful question. Let’s break it into a smaller step: what do you already understand, and where does the idea start to feel unclear? Share that part and I’ll meet you there.",
    suggestions: ["Explain it more simply", "Give me an example", "Turn this into a quiz"],
  };
  return res.json({
    id: `assistant-${Date.now()}`,
    role: "assistant",
    message: reply.message,
    suggestions: reply.suggestions,
  });
});

router.get("/opportunities", (req: Request, res: Response) => {
  const parsed = ListOpportunitiesQueryParams.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const search = parsed.data.search?.toLowerCase();
  const type = parsed.data.type;
  return res.json(
    opportunities.filter((item) => {
      const typeMatches = !type || type === "all" || item.kind === type;
      const searchMatches =
        !search ||
        `${item.title} ${item.organization} ${item.description}`.toLowerCase().includes(search);
      return typeMatches && searchMatches;
    }),
  );
});

router.patch("/opportunities/:id/save", (req: Request, res: Response) => {
  const body = ToggleOpportunitySaveBody.safeParse(req.body);
  if (!body.success) return sendValidationError(res, body.error);
  const opportunity = opportunities.find((item) => item.id === req.params.id);
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
  opportunity.saved = body.data.saved;
  return res.json(opportunity);
});

router.get("/community/posts", (_req, res) => res.json(communityPosts));

router.post("/community/posts", (req: Request, res: Response) => {
  const parsed = CreateCommunityPostBody.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const post = {
    id: `post-${Date.now()}`,
    author: profile.name,
    initials: profile.avatarInitials,
    group: parsed.data.group,
    title: parsed.data.title,
    body: parsed.data.body,
    likes: 0,
    replies: 0,
    liked: false,
    time: "Just now",
  };
  communityPosts.unshift(post);
  return res.status(201).json(post);
});

router.patch("/community/posts/:id/like", (req: Request, res: Response) => {
  const body = ToggleCommunityPostLikeBody.safeParse(req.body);
  if (!body.success) return sendValidationError(res, body.error);
  const post = communityPosts.find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.liked = body.data.liked;
  post.likes = Math.max(0, post.likes + (body.data.liked ? 1 : -1));
  return res.json(post);
});

router.get("/refreshment/quizzes", (_req, res) => res.json(quizzes));

router.get("/teacher/dashboard", (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Teacher login required" });
    return;
  }
  res.json(teacherDashboard);
});

export default router;