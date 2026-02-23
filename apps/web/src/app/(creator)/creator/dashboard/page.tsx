"use client";

import {
  BarChart3,
  BookOpen,
  Users,
  DollarSign,
  Plus,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const stats = [
  {
    label: "Total Courses",
    value: "0",
    icon: BookOpen,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Total Students",
    value: "0",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Total Revenue",
    value: "$0",
    icon: DollarSign,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Total Views",
    value: "0",
    icon: Eye,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

export default function CreatorDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your courses, track performance, and grow your audience
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-emerald-500/20">
          <Plus className="size-4" />
          Create Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">My Courses</h3>
              <p className="text-xs text-zinc-500">Manage your published and draft courses</p>
            </div>
          </div>
          <Separator className="bg-white/5 mb-4" />
          <div className="flex items-center justify-center py-8 text-zinc-600 text-sm">
            No courses yet. Create your first course to get started.
          </div>
          <Link href="/creator/courses">
            <Button
              variant="outline"
              className="w-full border-white/10 text-zinc-300 hover:bg-white/5 rounded-xl"
            >
              View All Courses
            </Button>
          </Link>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="size-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Analytics</h3>
              <p className="text-xs text-zinc-500">Track your performance and growth</p>
            </div>
          </div>
          <Separator className="bg-white/5 mb-4" />
          <div className="flex flex-col items-center justify-center py-8 text-zinc-600 text-sm gap-2">
            <TrendingUp className="size-8 text-zinc-700" />
            Analytics will appear once you have published courses.
          </div>
          <Link href="/creator/analytics">
            <Button
              variant="outline"
              className="w-full border-white/10 text-zinc-300 hover:bg-white/5 rounded-xl"
            >
              View Analytics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
