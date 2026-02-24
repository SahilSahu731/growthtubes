"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Globe,
  GlobeLock,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Users,
  Layers,
  Clock,
  BookOpen,
  Save,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  videoUrl: string | null;
  duration: number;
  sortOrder: number;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: Lesson[];
}

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
  sections: Section[];
  _count: { enrollments: number };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const lessonTypeIcons: Record<string, typeof Video> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Section form
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  // Lesson form
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState("VIDEO");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(0);
  const [newLessonFree, setNewLessonFree] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const { data } = await api.get(`/creator/courses/${courseId}`);
      setCourse(data.data.course);
      // Expand all sections by default
      const ids = new Set(data.data.course.sections.map((s: Section) => s.id));
      setExpandedSections(ids);
    } catch {
      router.push("/creator/courses");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Section CRUD ──
  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    setSavingSection(true);
    try {
      await api.post(`/creator/courses/${courseId}/sections`, {
        title: newSectionTitle.trim(),
      });
      setNewSectionTitle("");
      setShowNewSection(false);
      fetchCourse();
    } catch {
      alert("Failed to create section");
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    try {
      await api.delete(`/creator/sections/${sectionId}`);
      fetchCourse();
    } catch {
      alert("Failed to delete section");
    }
  };

  // ── Lesson CRUD ──
  const handleCreateLesson = async (sectionId: string) => {
    if (!newLessonTitle.trim()) return;
    setSavingLesson(true);
    try {
      await api.post(`/creator/sections/${sectionId}/lessons`, {
        title: newLessonTitle.trim(),
        type: newLessonType,
        videoUrl: newLessonVideoUrl.trim() || null,
        content: newLessonContent.trim() || null,
        duration: newLessonDuration,
        isFree: newLessonFree,
      });
      setNewLessonTitle("");
      setNewLessonType("VIDEO");
      setNewLessonVideoUrl("");
      setNewLessonContent("");
      setNewLessonDuration(0);
      setNewLessonFree(false);
      setAddingLessonTo(null);
      fetchCourse();
    } catch {
      alert("Failed to create lesson");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await api.delete(`/creator/lessons/${lessonId}`);
      fetchCourse();
    } catch {
      alert("Failed to delete lesson");
    }
  };

  // Publish / Unpublish
  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      const endpoint =
        course.status === "PUBLISHED"
          ? `/creator/courses/${course.id}/unpublish`
          : `/creator/courses/${course.id}/publish`;
      await api.patch(endpoint);
      fetchCourse();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  );
  const totalDuration = course.sections.reduce(
    (sum, s) =>
      sum + s.lessons.reduce((lSum, l) => lSum + l.duration, 0),
    0
  );
  const isPublished = course.status === "PUBLISHED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back */}
      <Link
        href="/creator/courses"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Back to Courses
      </Link>

      {/* ── Header Card ──────────────────────── */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Thumbnail */}
          <div className="w-full sm:w-40 h-24 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="size-10 text-zinc-700" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight line-clamp-2">
                  {course.title}
                </h1>
                {course.shortDescription && (
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                    {course.shortDescription}
                  </p>
                )}
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-500/10 text-zinc-400"
                }`}
              >
                {isPublished ? (
                  <Globe className="size-3" />
                ) : (
                  <GlobeLock className="size-3" />
                )}
                {course.status}
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Layers className="size-3" />
                {course.sections.length} sections
              </span>
              <span className="flex items-center gap-1">
                <FileText className="size-3" />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {Math.round(totalDuration / 60)} min
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {course._count.enrollments} students
              </span>
              {course.category && (
                <span
                  className="font-medium px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${course.category.color}15`,
                    color: course.category.color,
                  }}
                >
                  {course.category.name}
                </span>
              )}
              <span className="ml-auto text-zinc-600">
                {levelLabels[course.level]}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                onClick={handleTogglePublish}
                size="sm"
                className={`rounded-xl gap-1.5 text-xs font-semibold cursor-pointer ${
                  isPublished
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                }`}
              >
                {isPublished ? (
                  <>
                    <GlobeLock className="size-3.5" /> Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="size-3.5" /> Publish
                  </>
                )}
              </Button>
              <Link href={`/creator/courses/${course.id}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 text-xs border-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Pencil className="size-3.5" /> Edit Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections & Lessons ───────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Course Content
        </h2>
        <Button
          size="sm"
          onClick={() => setShowNewSection(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-1.5 text-xs cursor-pointer"
        >
          <Plus className="size-3.5" /> Add Section
        </Button>
      </div>

      {/* New Section form */}
      {showNewSection && (
        <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-white mb-2">New Section</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1 h-10 px-4 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSection();
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleCreateSection}
              disabled={!newSectionTitle.trim() || savingSection}
              className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl gap-1 cursor-pointer text-xs"
            >
              {savingSection ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save
            </Button>
            <button
              onClick={() => {
                setShowNewSection(false);
                setNewSectionTitle("");
              }}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-500"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section list */}
      {course.sections.length === 0 && !showNewSection ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-10 text-center">
          <Layers className="size-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 font-medium mb-1">
            No sections yet
          </p>
          <p className="text-xs text-zinc-600 mb-4">
            Add sections to organize your course content
          </p>
          <Button
            size="sm"
            onClick={() => setShowNewSection(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="size-3.5" /> Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {course.sections.map((section, sIdx) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div
                key={section.id}
                className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden"
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
                >
                  <GripVertical className="size-4 text-zinc-700 shrink-0" />
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-zinc-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      Section {sIdx + 1}: {section.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {section.lessons.length} lesson
                      {section.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                      title="Delete section"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </button>

                {/* Lessons */}
                {isExpanded && (
                  <div className="border-t border-white/5">
                    {section.lessons.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-zinc-600">
                          No lessons in this section
                        </p>
                      </div>
                    ) : (
                      <div>
                        {section.lessons.map((lesson, lIdx) => {
                          const LessonIcon =
                            lessonTypeIcons[lesson.type] || FileText;
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.02] transition-colors group"
                            >
                              <GripVertical className="size-3.5 text-zinc-700 shrink-0" />
                              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                <LessonIcon className="size-3.5 text-zinc-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-300 truncate">
                                  {lIdx + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-zinc-600">
                                    {lesson.type}
                                  </span>
                                  {lesson.duration > 0 && (
                                    <span className="text-[10px] text-zinc-600">
                                      {Math.round(lesson.duration / 60)} min
                                    </span>
                                  )}
                                  {lesson.isFree && (
                                    <span className="text-[10px] text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                      Free preview
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete lesson"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add lesson form */}
                    {addingLessonTo === section.id ? (
                      <div className="p-4 border-t border-white/5 bg-zinc-900/80">
                        <p className="text-xs font-medium text-white mb-3">
                          New Lesson
                        </p>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            placeholder="Lesson title"
                            className="w-full h-10 px-4 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            autoFocus
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={newLessonType}
                              onChange={(e) => setNewLessonType(e.target.value)}
                              className="h-10 px-3 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white appearance-none cursor-pointer"
                            >
                              <option value="VIDEO" className="bg-zinc-900">
                                Video
                              </option>
                              <option value="TEXT" className="bg-zinc-900">
                                Text
                              </option>
                              <option value="QUIZ" className="bg-zinc-900">
                                Quiz
                              </option>
                            </select>
                            <input
                              type="number"
                              value={newLessonDuration}
                              onChange={(e) =>
                                setNewLessonDuration(Number(e.target.value))
                              }
                              placeholder="Duration (sec)"
                              min={0}
                              className="h-10 px-3 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder:text-zinc-600 appearance-none"
                            />
                          </div>

                          {newLessonType === "VIDEO" && (
                            <input
                              type="url"
                              value={newLessonVideoUrl}
                              onChange={(e) =>
                                setNewLessonVideoUrl(e.target.value)
                              }
                              placeholder="Video URL"
                              className="w-full h-10 px-4 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                          )}

                          {newLessonType === "TEXT" && (
                            <textarea
                              value={newLessonContent}
                              onChange={(e) =>
                                setNewLessonContent(e.target.value)
                              }
                              placeholder="Lesson content..."
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                            />
                          )}

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newLessonFree}
                              onChange={(e) =>
                                setNewLessonFree(e.target.checked)
                              }
                              className="accent-emerald-500"
                            />
                            <span className="text-xs text-zinc-400">
                              Free preview lesson
                            </span>
                          </label>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleCreateLesson(section.id)
                              }
                              disabled={
                                !newLessonTitle.trim() || savingLesson
                              }
                              className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl gap-1 cursor-pointer text-xs"
                            >
                              {savingLesson ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                              Add Lesson
                            </Button>
                            <button
                              onClick={() => {
                                setAddingLessonTo(null);
                                setNewLessonTitle("");
                              }}
                              className="p-2 rounded-lg hover:bg-white/5 text-zinc-500"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 border-t border-white/5">
                        <button
                          onClick={() => setAddingLessonTo(section.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"
                        >
                          <Plus className="size-3" /> Add Lesson
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
