/**
 * Supabase-backed API client
 *
 * All data operations now go through Supabase directly (browser client) or
 * through Next.js API routes (for server-side logic / RLS bypass).
 *
 * Types are preserved exactly so that all existing component imports continue
 * to work without modification.
 */

import { createClient } from '@/lib/supabase/client';

// ─── Shared types ────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'learner' | 'instructor' | 'admin' | 'super-admin';
    firstName?: string;
    lastName?: string;
    activeCohortId?: string;
    avatar?: string;
    bio?: string;
    title?: string;
    phoneNumber?: string;
    location?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
  token: string;
}

export interface Profile {
  id: string;
  userId?: AuthResponse['user'];
  avatar?: string;
  bio?: string;
  title?: string;
  phoneNumber?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  learnerDetails?: {
    learningGoals: string[];
    interests: string[];
    education: string;
    currentOccupation: string;
  };
  instructorDetails?: {
    expertise: string[];
    experienceYears: number;
    teachingPhilosophy: string;
    achievements: string[];
  };
  adminDetails?: {
    department: string;
    officeHours: string;
    responsibilities: string[];
  };
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: 'learner' | 'instructor' | 'admin' | 'super-admin';
}

export interface Cohort {
  id: string;
  /** Legacy alias kept for backwards compatibility */
  _id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  instructorIds: string[];
  learnerIds: string[];
  courseIds: (string | any)[];
  performanceThreshold: number;
  weeklyTarget: number;
  gracePeriodDays: number;
  reviewCycleFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  allowedLearners?: string[];
}

export interface LearnerProgress {
  id: string;
  _id?: string;
  learnerId: string;
  cohortId: { id: string; name: string } | null;
  courseId: { id: string; name: string } | null;
  completedLessons: string[];
  currentScore: number;
  learningHoursThisWeek: number;
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped' | 'failed';
  lastActivityDate: string;
  inactivityDays: number;
  lastAssessmentScore: number;
  lastAssessmentDate?: string;
  updatedAt?: string;
  moduleProgress?: Array<{
    moduleId: string;
    scores: number[];
    averageScore: number;
    isGraduated: boolean;
  }>;
}

export interface DropRecommendation {
  id: string;
  _id?: string;
  learnerId: string;
  cohortId: string;
  instructorId: string;
  reason: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected' | 'appealed';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Appeal {
  id: string;
  _id?: string;
  learnerId: string;
  cohortId: string;
  dropRecommendationId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  type: 'exam' | 'assignment' | 'test' | 'lecture';
  cohortId: string;
  icon: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Normalise a Supabase row so it has both `id` and legacy `_id` fields. */
function normalise<T extends { id?: string; _id?: string }>(
  row: T
): T & { _id: string } {
  return { ...row, _id: row.id ?? row._id ?? '' };
}

function normaliseAll<T extends { id?: string; _id?: string }>(
  rows: T[]
): Array<T & { _id: string }> {
  return rows.map(normalise);
}

// ─── API Route helper (for complex server-side operations) ────────────────────

async function apiRoute(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Main API class ───────────────────────────────────────────────────────────

class APIClient {
  private get db() {
    return createClient();
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const supabase = this.db;
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          role: credentials.role ?? 'learner',
        },
      },
    });
    if (error) throw new Error(error.message);
    const u = data.user!;
    return {
      user: {
        id: u.id,
        email: u.email!,
        role: (u.user_metadata?.role ?? 'learner') as AuthResponse['user']['role'],
        firstName: u.user_metadata?.firstName,
        lastName: u.user_metadata?.lastName,
      },
      token: data.session?.access_token ?? '',
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const supabase = this.db;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw new Error(error.message);
    const u = data.user;
    return {
      user: {
        id: u.id,
        email: u.email!,
        role: (u.user_metadata?.role ?? 'learner') as AuthResponse['user']['role'],
        firstName: u.user_metadata?.firstName,
        lastName: u.user_metadata?.lastName,
      },
      token: data.session.access_token,
    };
  }

  async getMe(): Promise<AuthResponse> {
    const supabase = this.db;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return {
      user: {
        id: user.id,
        email: user.email!,
        role: (user.user_metadata?.role ?? 'learner') as AuthResponse['user']['role'],
        firstName: user.user_metadata?.firstName,
        lastName: user.user_metadata?.lastName,
      },
      token: '',
    };
  }

  logout() {
    this.db.auth.signOut();
  }

  // ── Cohorts ─────────────────────────────────────────────────────────────────

  async getCohorts(): Promise<Cohort[]> {
    const { data, error } = await this.db.from('cohorts').select('*');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as Cohort[];
  }

  async getCohort(id: string): Promise<Cohort> {
    const { data, error } = await this.db
      .from('cohorts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Cohort;
  }

  async createCohort(cohort: Partial<Cohort>): Promise<Cohort> {
    const { _id, ...rest } = cohort as any;
    const { data, error } = await this.db
      .from('cohorts')
      .insert(rest)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Cohort;
  }

  async updateCohort(id: string, cohort: Partial<Cohort>): Promise<Cohort> {
    const { _id, ...rest } = cohort as any;
    const { data, error } = await this.db
      .from('cohorts')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Cohort;
  }

  async deleteCohort(id: string): Promise<any> {
    const { error } = await this.db.from('cohorts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async updateAllowedLearners(id: string, emails: string[]): Promise<any> {
    const { error } = await this.db
      .from('cohorts')
      .update({ allowed_learners: emails })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ── Learner Progress ────────────────────────────────────────────────────────

  async getLearnerProgress(learnerId: string): Promise<LearnerProgress[]> {
    const { data, error } = await this.db
      .from('learner_progress')
      .select('*, cohortId:cohorts(id,name), courseId:courses(id,name)')
      .eq('learner_id', learnerId);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as LearnerProgress[];
  }

  async getLearnerTasks(learnerId: string): Promise<any[]> {
    const { data, error } = await this.db
      .from('tasks')
      .select('*')
      .eq('learner_id', learnerId);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async getLearnerProgressDashboard(learnerId: string): Promise<any> {
    const { data, error } = await this.db
      .from('learner_progress')
      .select('*, cohorts(name), courses(name)')
      .eq('learner_id', learnerId);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getLearnerNotifications(learnerId: string): Promise<any[]> {
    const { data, error } = await this.db
      .from('notifications')
      .select('*')
      .eq('user_id', learnerId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async getLearnerGradesAndReview(learnerId: string): Promise<any> {
    const { data, error } = await this.db
      .from('learner_progress')
      .select('*, courses(name), cohorts(name)')
      .eq('learner_id', learnerId);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  async getEvents(): Promise<Event[]> {
    const { data, error } = await this.db.from('events').select('*');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as Event[];
  }

  async getCohortEvents(cohortId: string): Promise<Event[]> {
    const { data, error } = await this.db
      .from('events')
      .select('*')
      .eq('cohort_id', cohortId);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as Event[];
  }

  // ── Cohort Learners ─────────────────────────────────────────────────────────

  async getCohortLearners(cohortId: string): Promise<any[]> {
    const { data, error } = await this.db
      .from('cohort_learners')
      .select('*, profiles(*), learner_progress(*)')
      .eq('cohort_id', cohortId);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  // ── Instructor Notes ────────────────────────────────────────────────────────

  async submitInstructorNote(note: any): Promise<any> {
    const { data, error } = await this.db
      .from('instructor_notes')
      .insert(note)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  // ── Drop Recommendations ────────────────────────────────────────────────────

  async submitDropRecommendation(
    recommendation: Partial<DropRecommendation>
  ): Promise<DropRecommendation> {
    const { _id, ...rest } = recommendation as any;
    const { data, error } = await this.db
      .from('drop_recommendations')
      .insert(rest)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as DropRecommendation;
  }

  async getDropRecommendations(): Promise<DropRecommendation[]> {
    const { data, error } = await this.db
      .from('drop_recommendations')
      .select('*, learner:profiles!learner_id(*), instructor:profiles!instructor_id(*)')
      .eq('status', 'pending');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as DropRecommendation[];
  }

  async updateDropRecommendation(
    id: string,
    update: { status: string; reviewNotes: string }
  ): Promise<DropRecommendation> {
    return apiRoute(`/api/drop-recommendations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  // ── Grace Periods ───────────────────────────────────────────────────────────

  async grantGracePeriod(gracePeriod: any): Promise<any> {
    const { data, error } = await this.db
      .from('grace_periods')
      .insert(gracePeriod)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  // ── Appeals ─────────────────────────────────────────────────────────────────

  async submitAppeal(appeal: Partial<Appeal>): Promise<Appeal> {
    const { _id, ...rest } = appeal as any;
    const { data, error } = await this.db
      .from('appeals')
      .insert(rest)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Appeal;
  }

  async getAppeals(): Promise<Appeal[]> {
    const { data, error } = await this.db
      .from('appeals')
      .select('*, learner:profiles!learner_id(*), drop_recommendation:drop_recommendations(*)')
      .eq('status', 'pending');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []) as unknown as Appeal[];
  }

  async updateAppeal(
    id: string,
    update: { status: string; reviewNotes: string }
  ): Promise<Appeal> {
    return apiRoute(`/api/appeals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  // ── Audit Logs ──────────────────────────────────────────────────────────────

  async getAuditLogs(): Promise<any[]> {
    const { data, error } = await this.db
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  // ── Users / Admin ───────────────────────────────────────────────────────────

  async getAllUsers(): Promise<any[]> {
    const { data, error } = await this.db.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  // ── Cohort Join / Application ───────────────────────────────────────────────

  async joinCohort(cohortId: string): Promise<any> {
    return apiRoute('/api/cohorts/join', {
      method: 'POST',
      body: JSON.stringify({ cohortId }),
    });
  }

  async applyToCourse(data: {
    cohortId: string;
    courseId: string;
    reason?: string;
  }): Promise<any> {
    return apiRoute('/api/cohorts/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingApplications(): Promise<any[]> {
    const { data, error } = await this.db
      .from('applications')
      .select('*, applicant:profiles!user_id(*), cohorts(*), courses(*)')
      .eq('status', 'pending');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async getMyApplications(): Promise<any[]> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('applications')
      .select('*, cohorts(*), courses(*)')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async handleApplication(
    id: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<any> {
    return apiRoute(`/api/cohorts/applications/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  async handleBulkApplications(
    ids: string[],
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<any> {
    return apiRoute('/api/cohorts/applications/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ ids, action, reason }),
    });
  }

  // ── Courses ─────────────────────────────────────────────────────────────────

  async getCourses(): Promise<any[]> {
    const { data, error } = await this.db
      .from('courses')
      .select('*, modules(*)');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async getCourseDetails(id: string): Promise<any> {
    const { data, error } = await this.db
      .from('courses')
      .select('*, modules(*, lessons(*))')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async createCourse(courseData: any): Promise<any> {
    const { data, error } = await this.db
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async updateCourse(id: string, courseData: any): Promise<any> {
    const { data, error } = await this.db
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async deleteCourse(id: string): Promise<any> {
    const { error } = await this.db.from('courses').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async searchPublicCourses(query?: string): Promise<any[]> {
    let q = this.db.from('courses').select('*').eq('is_public', true);
    if (query) q = q.ilike('name', `%${query}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  // ── Modules ─────────────────────────────────────────────────────────────────

  async createModule(moduleData: any): Promise<any> {
    const { data, error } = await this.db
      .from('modules')
      .insert(moduleData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async updateModule(id: string, moduleData: any): Promise<any> {
    const { data, error } = await this.db
      .from('modules')
      .update(moduleData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async deleteModule(id: string): Promise<any> {
    const { error } = await this.db.from('modules').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ── Lessons ─────────────────────────────────────────────────────────────────

  async createLesson(lessonData: any): Promise<any> {
    const { data, error } = await this.db
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async updateLesson(id: string, lessonData: any): Promise<any> {
    const { data, error } = await this.db
      .from('lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data);
  }

  async deleteLesson(id: string): Promise<any> {
    const { error } = await this.db.from('lessons').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ── Submissions ─────────────────────────────────────────────────────────────

  async submitAssignment(data: {
    lessonId: string;
    cohortId: string;
    content: string;
  }): Promise<any> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: row, error } = await supabase
      .from('submissions')
      .insert({
        lesson_id: data.lessonId,
        cohort_id: data.cohortId,
        content: data.content,
        user_id: user?.id,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(row);
  }

  async getSubmissions(cohortId: string): Promise<any[]> {
    const { data, error } = await this.db
      .from('submissions')
      .select('*, profiles(*), lessons(*)')
      .eq('cohort_id', cohortId);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async gradeSubmission(data: {
    submissionId: string;
    grade: number;
    feedback: string;
  }): Promise<any> {
    const { data: row, error } = await this.db
      .from('submissions')
      .update({ grade: data.grade, feedback: data.feedback, graded_at: new Date().toISOString() })
      .eq('id', data.submissionId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(row);
  }

  async getMySubmission(lessonId: string, cohortId: string): Promise<any> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('cohort_id', cohortId)
      .eq('user_id', user?.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? normalise(data) : null;
  }

  async getAllSubmissions(): Promise<any[]> {
    const { data, error } = await this.db
      .from('submissions')
      .select('*, profiles(*), lessons(*), cohorts(*)');
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  // ── Cohort Course Management ─────────────────────────────────────────────────

  async addCourseToCohort(cohortId: string, courseId: string): Promise<any> {
    const { error } = await this.db
      .from('cohort_courses')
      .insert({ cohort_id: cohortId, course_id: courseId });
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async removeCourseFromCohort(cohortId: string, courseId: string): Promise<any> {
    const { error } = await this.db
      .from('cohort_courses')
      .delete()
      .eq('cohort_id', cohortId)
      .eq('course_id', courseId);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  // ── Instructor helpers ───────────────────────────────────────────────────────

  async getInstructorLearners(): Promise<any[]> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('cohort_learners')
      .select('*, profiles(*), learner_progress(*)')
      .eq('instructor_id', user.id);
    if (error) throw new Error(error.message);
    return normaliseAll(data ?? []);
  }

  async getInstructorDashboardStats(): Promise<any> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from('instructor_stats')
      .select('*')
      .eq('instructor_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? {};
  }

  // ── AI ───────────────────────────────────────────────────────────────────────

  async generateAIQuiz(data: {
    title: string;
    description?: string;
    difficulty: 'easy' | 'hard';
  }): Promise<any[]> {
    return apiRoute('/api/ai/generate-quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Profile ──────────────────────────────────────────────────────────────────

  async getProfile(): Promise<Profile> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Profile;
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    const supabase = this.db;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { id, userId, ...rest } = profileData as any;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...rest, id: user.id, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalise(data) as unknown as Profile;
  }
}

export const api = new APIClient();
