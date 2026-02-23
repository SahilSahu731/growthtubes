"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  UserCheck,
  Palette,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  totalProfiles: number;
  creatorCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data.data.stats);
      } catch {
        // Stats fetch failed
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          label: "Verified Users",
          value: stats.verifiedUsers,
          icon: UserCheck,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Profiles Created",
          value: stats.totalProfiles,
          icon: Palette,
          color: "text-violet-400",
          bg: "bg-violet-500/10",
        },
        {
          label: "Creators",
          value: stats.creatorCount,
          icon: Shield,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Shield className="size-4 text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1 ml-11">
          System overview and management tools
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
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
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Management
            </h3>
            <Separator className="bg-white/5 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors"
              >
                <Users className="size-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    User Management
                  </p>
                  <p className="text-xs text-zinc-500">
                    View, edit, and manage all users
                  </p>
                </div>
              </a>
              <a
                href="/admin/roles"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors"
              >
                <Shield className="size-5 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Role Management
                  </p>
                  <p className="text-xs text-zinc-500">
                    Assign roles and permissions
                  </p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
