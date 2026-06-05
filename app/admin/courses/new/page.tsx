'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type Step = 'details' | 'curriculum';

export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [course, setCourse] = useState<any>(null);

  const handleCourseCreated = (created: any) => {
    setCourse(created);
    setStep('curriculum');
  };

  const handleComplete = () => {
    router.push('/admin/courses');
  };

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
          <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-1">
            {step === 'details' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </Badge>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900">
            {step === 'details' ? 'New Course' : 'Build Curriculum'}
          </h1>
        </div>
      </div>

      {step === 'details' && (
        <CourseForm onSuccess={handleCourseCreated} />
      )}

      {step === 'curriculum' && course && (
        <ModuleManager
          courseId={course.id ?? course._id}
          initialModules={[]}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
