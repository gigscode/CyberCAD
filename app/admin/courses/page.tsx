'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/stat-card';
import {
  BookOpen, Plus, Search, Edit3, Trash2, Users,
  Eye, EyeOff, MoreVertical, Loader2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
};

export default function AdminCoursesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, enrolments(id)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data ?? []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (course: any) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success(course.is_published ? 'Course unpublished' : 'Course published');
    load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', toDelete.id);
    setIsDeleting(false);
    if (error) { toast.error('Failed to delete course'); return; }
    toast.success('Course deleted');
    setToDelete(null);
    load();
  };

  const filtered = courses.filter(c =>
    `${c.name} ${c.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const published = courses.filter(c => c.is_published).length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-slate-100 animate-pulse rounded-[32px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/60">
        <div>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider mb-2">
            Content Management
          </Badge>
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">Courses</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage the full course catalogue.</p>
        </div>
        <Button
          onClick={() => router.push('/admin/courses/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 rounded-xl px-6 font-semibold text-sm shadow-lg shadow-indigo-100"
        >
          <Plus className="w-4 h-4 mr-2" /> New Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length}
          iconColor="text-indigo-600" iconBgColor="bg-indigo-50" />
        <StatCard icon={Eye} label="Published" value={published}
          iconColor="text-emerald-600" iconBgColor="bg-emerald-50" />
        <StatCard icon={Users} label="Total Enrolments" value={courses.reduce((s, c) => s + (c.enrolments?.length ?? 0), 0)}
          iconColor="text-blue-600" iconBgColor="bg-blue-50" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-white border-slate-100 shadow-sm" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-400 text-sm">No courses found</p>
          <Button onClick={() => router.push('/admin/courses/new')} variant="outline" className="rounded-xl font-semibold">
            Create your first course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col group">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : '📚'}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={cn('text-[9px] font-semibold uppercase border-none',
                    c.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                  )}>
                    {c.is_published ? 'Live' : 'Draft'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-100">
                        <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-lg p-1 w-44">
                      <DropdownMenuItem onClick={() => router.push(`/admin/courses/edit/${c.id}`)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 gap-2">
                        <Edit3 className="w-4 h-4 opacity-50" /> Edit Content
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(c)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 gap-2">
                        {c.is_published ? <EyeOff className="w-4 h-4 opacity-50" /> : <Eye className="w-4 h-4 opacity-50" />}
                        {c.is_published ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setToDelete(c)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 cursor-pointer hover:bg-rose-50 gap-2">
                        <Trash2 className="w-4 h-4 opacity-70" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1.5">
                <h3 className="font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c.enrolments?.length ?? 0}
                  </span>
                  {c.level && (
                    <Badge className={cn('text-[9px] font-semibold uppercase border-none', LEVEL_COLORS[c.level] ?? 'bg-slate-50 text-slate-500')}>
                      {c.level}
                    </Badge>
                  )}
                </div>
                {c.price_kobo > 0 && (
                  <span className="text-sm font-bold text-slate-700">
                    ₦{(c.price_kobo / 100).toLocaleString('en-NG')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!toDelete} onOpenChange={open => !open && setToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-slate-900">Delete Course?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              This permanently deletes <span className="font-semibold text-slate-800">"{toDelete?.name}"</span> and all
              its modules, lessons, and learner submissions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-11 border-slate-200 font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
