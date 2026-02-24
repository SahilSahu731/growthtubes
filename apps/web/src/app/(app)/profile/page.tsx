"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  User,
  Mail,
  AtSign,
  FileText,
  Shield,
  Calendar,
  Flame,
  Trophy,
  Crown,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Trash2,
  Camera,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface ProfileData {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  plan: string;
  isPremium: boolean;
  streakCount: number;
  longestStreak: number;
  onboardingCompleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  profile: ProfileData | null;
}

function getInitials(email: string, name?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.substring(0, 2).toUpperCase();
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const showToast = (
    status: "success" | "error",
    message: string,
    duration = 3000
  ) => {
    setSaveStatus(status);
    setSaveMessage(message);
    setTimeout(() => setSaveStatus("idle"), duration);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/profile");
      const user = data.data.user;
      setUserData(user);
      setFullName(user.profile?.fullName || "");
      setUsername(user.profile?.username || "");
      setBio(user.profile?.bio || "");
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/profile", { fullName, username, bio });
      showToast("success", "Profile updated successfully");
      await fetchProfile();
      useAuthStore.getState().getMe();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(
        "error",
        error.response?.data?.message || "Failed to update profile",
        4000
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Only JPEG, PNG, WebP, and GIF are allowed", 4000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Image must be under 5MB", 4000);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Avatar updated!");
      await fetchProfile();
      useAuthStore.getState().getMe();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(
        "error",
        error.response?.data?.message || "Failed to upload avatar",
        4000
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await api.delete("/profile/avatar");
      showToast("success", "Avatar removed");
      await fetchProfile();
      useAuthStore.getState().getMe();
    } catch {
      showToast("error", "Failed to remove avatar", 4000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/profile");
      await logout();
      router.push("/");
    } catch {
      showToast("error", "Failed to delete account", 4000);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const profile = userData.profile;
  const initials = getInitials(userData.email, profile?.fullName);
  const bioLength = bio.length;
  const maxBio = 300;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Save Status Toast */}
      {saveStatus !== "idle" && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-5 fade-in duration-300 ${
            saveStatus === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <span className="text-sm font-medium">{saveMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ── Left Column — Avatar & Stats ── */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with hover overlay */}
              <div className="relative group mb-4">
                <Avatar className="size-24 ring-4 ring-emerald-500/20 transition-all duration-200 group-hover:ring-emerald-500/40">
                  {profile?.avatarUrl ? (
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={profile.fullName || "Profile"}
                    />
                  ) : null}
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Hover overlay */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="size-6 text-white animate-spin" />
                  ) : (
                    <Camera className="size-6 text-white" />
                  )}
                </button>

                {/* Remove avatar button — only shown when avatar exists */}
                {profile?.avatarUrl && !isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/30"
                  >
                    <X className="size-3 text-zinc-400 hover:text-red-400" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-zinc-600 mb-3">
                Click avatar to change • Max 5MB
              </p>

              <h2 className="text-lg font-semibold text-white">
                {profile?.fullName || userData.email.split("@")[0]}
              </h2>
              {profile?.username && (
                <p className="text-sm text-zinc-400">@{profile.username}</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${
                    profile?.plan === "PRO"
                      ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                      : "border-zinc-700 text-zinc-400 bg-zinc-800/50"
                  }`}
                >
                  {profile?.plan === "PRO" ? (
                    <>
                      <Crown className="size-3 mr-1" />
                      Pro
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs font-medium border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                >
                  {profile?.role || "USER"}
                </Badge>
              </div>
            </div>

            {profile?.bio && (
              <>
                <Separator className="bg-white/5" />
                <p className="text-sm text-zinc-300 leading-relaxed text-center">
                  {profile.bio}
                </p>
              </>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Flame className="size-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Current Streak
                    </p>
                    <p className="text-xs text-zinc-500">Days active</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-400">
                  {profile?.streakCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Trophy className="size-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Longest Streak
                    </p>
                    <p className="text-xs text-zinc-500">Personal best</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-400">
                  {profile?.longestStreak || 0}
                </span>
              </div>

              <Separator className="bg-white/5" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="size-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Member Since
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(userData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="size-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Email Status
                    </p>
                    <p className="text-xs text-zinc-500">
                      {userData.isEmailVerified ? "Verified" : "Not verified"}
                    </p>
                  </div>
                </div>
                {userData.isEmailVerified && (
                  <CheckCircle className="size-5 text-emerald-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column — Edit Form ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <User className="size-4 text-emerald-400" />
                Personal Information
              </h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                Update your personal details
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm text-zinc-300 flex items-center gap-1.5"
                >
                  <User className="size-3.5 text-zinc-500" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm text-zinc-300 flex items-center gap-1.5"
                >
                  <AtSign className="size-3.5 text-zinc-500" />
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                    )
                  }
                  placeholder="your-username"
                  className="h-11 bg-white/3 border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
                <p className="text-xs text-zinc-600">
                  Letters, numbers, underscores, hyphens only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-sm text-zinc-300 flex items-center gap-1.5"
              >
                <FileText className="size-3.5 text-zinc-500" />
                Bio
              </Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxBio) setBio(e.target.value);
                }}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="w-full px-3 py-2.5 bg-white/3 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 focus:outline-none resize-none transition-colors"
              />
              <p
                className={`text-xs text-right ${
                  bioLength >= maxBio - 20 ? "text-amber-400" : "text-zinc-600"
                }`}
              >
                {bioLength}/{maxBio}
              </p>
            </div>
          </div>

          {/* Account Info (Read Only) */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Mail className="size-4 text-emerald-400" />
                Account Information
              </h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                These details are managed by your authentication settings
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Email Address</Label>
                <div className="h-11 px-3.5 bg-white/2 border border-white/5 rounded-xl flex items-center gap-2">
                  <Mail className="size-4 text-zinc-600" />
                  <span className="text-sm text-zinc-400 truncate">
                    {userData.email}
                  </span>
                  {userData.isEmailVerified && (
                    <CheckCircle className="size-4 text-emerald-400 shrink-0 ml-auto" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Account ID</Label>
                <div className="h-11 px-3.5 bg-white/2 border border-white/5 rounded-xl flex items-center">
                  <span className="text-sm text-zinc-500 font-mono truncate">
                    {userData.id.substring(0, 8)}...
                    {userData.id.substring(userData.id.length - 4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl px-8 h-11 shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="size-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-zinc-900/50 border border-red-500/10 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-red-400">
                Danger Zone
              </h3>
              <p className="text-sm text-zinc-500 mt-0.5">
                Irreversible actions — proceed with caution
              </p>
            </div>

            <Separator className="bg-red-500/10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Log out</p>
                <p className="text-xs text-zinc-500">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl gap-2"
              >
                <LogOut className="size-4" />
                Log out
              </Button>
            </div>

            <Separator className="bg-red-500/10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Delete Account
                </p>
                <p className="text-xs text-zinc-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl gap-2"
                  >
                    <Trash2 className="size-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border border-white/10 rounded-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      This action cannot be undone. This will permanently delete
                      your account, profile, and all associated data.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteDialog(false)}
                      className="text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl gap-2"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete my account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}