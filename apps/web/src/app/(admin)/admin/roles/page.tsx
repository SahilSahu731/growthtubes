"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const roles = [
  {
    name: "USER",
    description: "Standard user. Can browse courses, enroll, and access their profile.",
    color: "border-zinc-600 text-zinc-400 bg-zinc-800/50",
    permissions: ["Browse courses", "Enroll in courses", "Edit profile", "View dashboard"],
  },
  {
    name: "CREATOR",
    description: "Content creator. Can create and manage courses, view analytics, and has all USER permissions.",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    permissions: [
      "All USER permissions",
      "Create courses",
      "Edit own courses",
      "View creator analytics",
      "Manage course content",
    ],
  },
  {
    name: "ADMIN",
    description: "Full system administrator. Has unrestricted access to all features and management tools.",
    color: "border-red-500/30 text-red-400 bg-red-500/10",
    permissions: [
      "All CREATOR permissions",
      "Manage all users",
      "Assign roles",
      "Access admin dashboard",
      "System configuration",
      "View all analytics",
    ],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Shield className="size-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Role Management
          </h1>
          <p className="text-sm text-zinc-400">
            Overview of roles and their permissions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className={`text-xs font-medium ${role.color}`}>
                <Shield className="size-3 mr-1" />
                {role.name}
              </Badge>
            </div>
            <p className="text-sm text-zinc-300 mb-4">{role.description}</p>
            <Separator className="bg-white/5 mb-4" />
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Permissions
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {role.permissions.map((perm) => (
                  <li
                    key={perm}
                    className="text-sm text-zinc-400 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
