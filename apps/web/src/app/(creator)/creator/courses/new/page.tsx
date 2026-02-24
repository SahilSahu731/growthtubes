"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Save,
  ImageIcon,
  Info,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

const levels = [
  { value: "ALL_LEVELS", label: "All Levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("ALL_LEVELS");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [language, setLanguage] = useState("English");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch {
      //
    } finally {
      setIsLoadingCats(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const { data } = await api.post("/creator/courses", {
        title: title.trim(),
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        level,
        categoryId: categoryId || null,
        thumbnail: thumbnail.trim() || null,
        isFree,
        price: isFree ? 0 : price,
        language: language.trim() || "English",
        tags,
      });

      router.push(`/creator/courses/${data.data.course.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to create course");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back */}
      <Link
        href="/creator/courses"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="size-3.5" />
        Back to Courses
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Create New Course
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Fill in the basics — you can add sections and lessons after creating the
          course.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Course Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete Web Development Bootcamp"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            maxLength={150}
            required
          />
          <p className="text-[11px] text-zinc-600 mt-1">
            {title.length}/150 characters
          </p>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Short Description
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A brief one-liner about your course"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            maxLength={200}
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Full Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what students will learn, prerequisites, and course structure..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all resize-none"
          />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all appearance-none cursor-pointer"
            >
              {levels.map((l) => (
                <option key={l.value} value={l.value} className="bg-zinc-900">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Category
            </label>
            {isLoadingCats ? (
              <div className="h-11 flex items-center px-4 rounded-xl bg-zinc-900/50 border border-white/10">
                <Loader2 className="size-4 animate-spin text-zinc-500" />
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">
                  No category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Thumbnail URL
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
            />
          </div>
          {thumbnail && (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/5 w-48 h-28">
              <img
                src={thumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Language
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="English"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
          />
        </div>

        {/* Pricing */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="size-4 text-emerald-400" />
            <p className="text-sm font-medium text-white">Pricing</p>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isFree}
                onChange={() => setIsFree(true)}
                className="accent-emerald-500"
              />
              <span className="text-sm text-zinc-300">Free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isFree}
                onChange={() => setIsFree(false)}
                className="accent-emerald-500"
              />
              <span className="text-sm text-zinc-300">Paid</span>
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-40 h-10 px-4 rounded-xl bg-zinc-800 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/50 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
              />
            </div>
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-xs text-zinc-300 border border-white/5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-zinc-600 mt-1">
            {tags.length}/10 tags
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Button
            type="submit"
            disabled={!title.trim() || isSaving}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-emerald-500/20 px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Creating..." : "Create Course"}
          </Button>
          <Link href="/creator/courses">
            <Button
              type="button"
              variant="ghost"
              className="text-zinc-400 hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
