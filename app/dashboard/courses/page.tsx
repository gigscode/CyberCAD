'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Lock, X, Search, BookOpen, Clock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [learnerProgress, setLearnerProgress] = useState<any[]>([]);
  const router = useRouter();

  // Locked course info modal
  const [lockedCourse, setLockedCourse] = useState<any>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // 1. Fetch all courses — no cohort filter needed
      const allCourses = await api.getCourses();

      // 2. Fetch learner progress
      let progress: any[] = [];
      if (user.role === 'learner') {
        progress = await api.getLearnerProgress(user.id);
        setLearnerProgress(progress);
      }

      // 3. Enhance courses with enrollment status
      const enhancedData = allCourses.map((c: any, i: number) => {
        const enrollment = progress.find(p => {
          if (!['on-track', 'at-risk', 'under-review', 'completed'].includes(p.status)) return false;
          const pId = typeof p.courseId === 'object' ? p.courseId?._id : p.courseId;
          return pId === c._id;
        });

        let status = 'available';
        let progressVal = 0;

        if (enrollment) {
          status = enrollment.status === 'completed' ? 'completed' : 'enrolled';
          progressVal = enrollment.currentScore || 0;
        }

        return {
          ...c,
          id: c._id,
          color: c.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
          icon: c.icon || ['💻', '⚛️', '🎨', '🗄️'][i % 4],
          progress: progressVal,
          learnerStatus: status,
          instructor: 'SecAcad Faculty',
        };
      });

      setCourses(enhancedData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCourses = filteredCourses.filter(c => c.learnerStatus === 'enrolled');
  const completedCourses = filteredCourses.filter(c => c.learnerStatus === 'completed');
  const availableCourses = filteredCourses.filter(c => c.learnerStatus === 'available');

  const renderCourseCard = (course: any) => (
    <div
      key={course.id}
      className={cn(
        "relative group h-full",
        course.learnerStatus === 'enrolled' || course.learnerStatus === 'completed' ? "cursor-pointer" : "cursor-default"
      )}
    >
      <CourseCard
        title={course.name}
        subtitle={course.description}
        icon={course.icon}
        progress={course.progress}
        duration={course.duration || 'N/A'}
        instructor={course.instructor}
        registrarsCount={undefined}
        color={course.color}
        onClick={() => {
          if (course.learnerStatus === 'enrolled' || course.learnerStatus === 'completed') {
            router.push(`/dashboard/courses/${course.id || course._id}`);
          } else {
            setLockedCourse(course);
          }
        }}
      />

      {/* Status badges */}
      <div className="absolute top-4 right-4 z-20">
        {course.learnerStatus === 'enrolled' ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm font-bold px-3">Enrolled</Badge>
        ) : course.learnerStatus === 'completed' ? (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 shadow-sm font-bold px-3">Completed</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 shadow-sm flex items-center gap-1 font-bold px-3"><Lock className="w-3 h-3" />Locked</Badge>
        )}
      </div>

      {/* Locked overlay for unenrolled courses */}
      {course.learnerStatus === 'available' && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setLockedCourse(course); }}
        >
          <div className="bg-white/95 p-5 rounded-2xl shadow-xl w-full max-w-[220px] text-center space-y-3">
            <Lock className="w-6 h-6 mx-auto text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-800">{course.name}</h3>
            <Button
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-[11px] h-8 rounded-xl"
              onClick={(e) => { e.stopPropagation(); setLockedCourse(course); }}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Unlock Course
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 capitalize">
              {enrolledCourses.length > 0 ? 'My Curriculum' : 'Explore Courses'}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
              {enrolledCourses.length > 0
                ? 'Access your learning materials and track your progress.'
                : 'Browse our cybersecurity training courses. Pay once, learn forever.'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search bar */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-full md:w-fit">
              <div className="relative flex-1 md:w-80">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2 text-sm outline-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-100/50 p-1 mb-8 h-auto rounded-xl w-full flex overflow-x-auto overflow-y-hidden no-scrollbar justify-start gap-1">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">All Courses ({filteredCourses.length})</TabsTrigger>
                <TabsTrigger value="enrolled" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">Enrolled ({enrolledCourses.length})</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">Completed ({completedCourses.length})</TabsTrigger>
                <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">Available ({availableCourses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => renderCourseCard(course))}
                </div>
              </TabsContent>

              <TabsContent value="enrolled" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => renderCourseCard(course))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map(course => renderCourseCard(course))}
                </div>
              </TabsContent>

              <TabsContent value="available" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map(course => renderCourseCard(course))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Payment-based unlock modal */}
      {lockedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-purple-600 p-6 text-white relative">
              <button onClick={() => setLockedCourse(null)} className="absolute top-4 right-4 hover:bg-white/20 rounded-lg p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">{lockedCourse.icon || '📚'}</div>
                <div>
                  <h3 className="text-xl font-bold">Unlock Course</h3>
                  <p className="text-white/80 text-sm">{lockedCourse.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-slate-600 text-sm leading-relaxed">
                Get instant access to this course with a single payment. Learn at your own pace — no deadlines, no expiry.
              </p>

              <div className="bg-orange-50 rounded-2xl p-4 space-y-3 border border-orange-100/50">
                <h4 className="font-semibold text-slate-900 text-sm">What you get:</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-600 shrink-0" />
                    Lifetime access to all course modules
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                    Self-paced learning — go at your speed
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-600 shrink-0" />
                    One-time payment via Paystack
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setLockedCourse(null)}>
                  Maybe Later
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700 rounded-xl h-12 font-medium shadow-lg shadow-orange-200 active:scale-95 transition-all"
                  onClick={() => {
                    setLockedCourse(null);
                    router.push(`/dashboard/courses/${lockedCourse.id}/enroll`);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}