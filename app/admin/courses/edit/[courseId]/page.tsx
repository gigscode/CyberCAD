'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'details' | 'curriculum';

export default function EditCoursePage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('details');
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, [courseId]);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, modules(*, lessons(*))')
        .eq('id', courseId)
        .single();
      if (error) throw error;
      setCourse(data);
      // Normalise so ModuleManager gets _id fields
      const normalised = (data.modules ?? []).map((m: any) => ({
        ...m,
        _id: m.id,
        lessons: (m.lessons ?? []).map((l: any) => ({ ...l, _id: l.id })),
      }));
      setModules(normalised);
    } catch {
      toast.error('Failed to load course');
      router.push('/admin/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseUpdated = (updated: any) => {
    setCourse(updated);
    setStep('curriculum');
  };

  const handleComplete = () => {
    router.push('/admin/courses');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 'curriculum' ? setStep('details') : router.push('/admin/courses')}
          className="rounded-xl h-9 w-9 text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <Badge className="bg-amber-50 text-amber-700 border-amber-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-1">
            Editing
          </Badge>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">
            {step === 'details' ? course?.name : 'Curriculum Builder'}
          </h1>
        </div>
      </div>

      {step === 'details' && course && (
        <CourseForm
          initialData={{
            id: course.id,
            name: course.name,
            description: course.description ?? '',
            duration: course.duration ?? 0,
          }}
          onSuccess={handleCourseUpdated}
        />
      )}

      {step === 'curriculum' && (
        <ModuleManager
          courseId={courseId}
          initialModules={modules}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
