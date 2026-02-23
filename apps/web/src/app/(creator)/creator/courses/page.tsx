"use client";

import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreatorCoursesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Courses
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, edit, and manage your courses
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-emerald-500/20">
          <Plus className="size-4" />
          New Course
        </Button>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <BookOpen className="size-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No courses yet
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          You haven&apos;t created any courses yet. Start building your first
          course to share your knowledge with the world.
        </p>
        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2">
          <Plus className="size-4" />
          Create Your First Course
        </Button>
      </div>
    </div>
  );
}
