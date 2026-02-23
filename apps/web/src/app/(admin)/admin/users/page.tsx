"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface UserItem {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  profile: {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
    plan: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const roleColors: Record<string, string> = {
  USER: "border-zinc-600 text-zinc-400 bg-zinc-800/50",
  CREATOR: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  ADMIN: "border-red-500/30 text-red-400 bg-red-500/10",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/admin/users?page=${page}&limit=20`);
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch {
      // fetch failed
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers(pagination?.page || 1);
    } catch {
      // role change failed
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Users className="size-4 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-zinc-400">
            {pagination?.total || 0} total users
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {user.profile?.fullName || user.email.split("@")[0]}
                          </p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                          {user.profile?.username && (
                            <p className="text-xs text-zinc-600">
                              @{user.profile.username}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.isEmailVerified ? (
                            <>
                              <CheckCircle className="size-3.5 text-emerald-400" />
                              <span className="text-xs text-emerald-400">Verified</span>
                            </>
                          ) : (
                            <span className="text-xs text-zinc-500">Unverified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            roleColors[user.profile?.role || "USER"]
                          }`}
                        >
                          <Shield className="size-3 mr-1" />
                          {user.profile?.role || "USER"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Select
                          value={user.profile?.role || "USER"}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={changingRole === user.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs bg-white/3 border-white/10 rounded-lg text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border border-white/10 rounded-xl">
                            <SelectItem value="USER" className="text-zinc-300">
                              User
                            </SelectItem>
                            <SelectItem value="CREATOR" className="text-emerald-400">
                              Creator
                            </SelectItem>
                            <SelectItem value="ADMIN" className="text-red-400">
                              Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-zinc-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  className="border-white/10 text-zinc-300 rounded-lg"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  className="border-white/10 text-zinc-300 rounded-lg"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
