"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Loader2,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Globe,
  GlobeLock,
  Users,
  Layers,
  FileText,
  Clock,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnail: string | null;
  level: string;
  status: string;
  price: number;
  isFree: boolean;
  language: string;
  tags: string[];
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
  } | null;
  _count: {
    sections: number;
    enrollments: number;
    lessons: number;
  };
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Globe }
> = {
  DRAFT: {
    label: "Draft",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    icon: GlobeLock,
  },
  PUBLISHED: {
    label: "Published",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: Globe,
  },
  ARCHIVED: {
    label: "Archived",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: GlobeLock,
  },
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

export default function CreatorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== "ALL") params.status = filter;
      const { data } = await api.get("/creator/courses", { params });
      setCourses(data.data.courses);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/creator/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const endpoint =
        course.status === "PUBLISHED"
          ? `/creator/courses/${course.id}/unpublish`
          : `/creator/courses/${course.id}/publish`;
      await api.patch(endpoint);
      fetchCourses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to update course status");
    }
  };

  const filteredCourses = courses;

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    draft: courses.filter((c) => c.status === "DRAFT").length,
    students: courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Courses
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, edit, and manage your courses
          </p>
        </div>
        <Link href="/creator/courses/new">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer">
            <Plus className="size-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: BookOpen, color: "text-blue-400" },
          { label: "Published", value: stats.published, icon: Globe, color: "text-emerald-400" },
          { label: "Drafts", value: stats.draft, icon: FileText, color: "text-zinc-400" },
          { label: "Students", value: stats.students, icon: Users, color: "text-violet-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 flex items-center gap-3"
          >
            <s.icon className={`size-5 ${s.color}`} />
            <div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-white text-black"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 text-emerald-500 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <BookOpen className="size-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {filter === "ALL" ? "No courses yet" : `No ${filter.toLowerCase()} courses`}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-6">
            {filter === "ALL"
              ? "Start building your first course to share your knowledge with the world."
              : "Try changing the filter or create a new course."}
          </p>
          <Link href="/creator/courses/new">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2 cursor-pointer">
              <Plus className="size-4" />
              Create Your First Course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const st = statusConfig[course.status] || statusConfig.DRAFT;
            return (
              <div
                key={course.id}
                className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="hidden sm:block w-32 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="size-8 text-zinc-700" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/creator/courses/${course.id}`}
                          className="text-base font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-1"
                        >
                          {course.title}
                        </Link>
                        {course.shortDescription && (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                            {course.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 cursor-pointer">
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl p-1"
                        >
                          <Link href={`/creator/courses/${course.id}`}>
                            <DropdownMenuItem className="gap-2.5 text-xs cursor-pointer rounded-lg">
                              <Eye className="size-3.5" /> View Details
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/creator/courses/${course.id}/edit`}>
                            <DropdownMenuItem className="gap-2.5 text-xs cursor-pointer rounded-lg">
                              <Pencil className="size-3.5" /> Edit Course
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            className="gap-2.5 text-xs cursor-pointer rounded-lg"
                            onClick={() => handleTogglePublish(course)}
                          >
                            {course.status === "PUBLISHED" ? (
                              <>
                                <GlobeLock className="size-3.5" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Globe className="size-3.5 text-emerald-400" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            className="gap-2.5 text-xs cursor-pointer rounded-lg text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(course.id)}
                            disabled={deletingId === course.id}
                          >
                            <Trash2 className="size-3.5" />{" "}
                            {deletingId === course.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
                      {/* Status */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${st.bg} ${st.color}`}
                      >
                        <st.icon className="size-3" />
                        {st.label}
                      </span>

                      {/* Level */}
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Badge className="size-3" />
                        {levelLabels[course.level] || course.level}
                      </span>

                      {/* Sections */}
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Layers className="size-3" />
                        {course._count?.sections || 0} sections
                      </span>

                      {/* Lessons */}
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <FileText className="size-3" />
                        {course._count?.lessons || 0} lessons
                      </span>

                      {/* Students */}
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Users className="size-3" />
                        {course._count?.enrollments || 0} students
                      </span>

                      {/* Category */}
                      {course.category && (
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${course.category.color}15`,
                            color: course.category.color,
                          }}
                        >
                          {course.category.name}
                        </span>
                      )}

                      {/* Updated */}
                      <span className="text-[11px] text-zinc-600 flex items-center gap-1 ml-auto">
                        <Clock className="size-3" />
                        {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
