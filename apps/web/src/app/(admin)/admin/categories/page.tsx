"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  GripVertical,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DynamicIcon, isValidIconName, getIconNames } from "@/components/DynamicIcon";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_COLOR = "#10b981";

const presetColors = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#f97316",
];

const popularIcons = [
  "Code", "Palette", "Globe", "BookOpen", "Camera",
  "Music", "Gamepad2", "TrendingUp", "Smartphone", "Cpu",
  "PenTool", "Video", "Megaphone", "Heart", "ShieldCheck",
  "Briefcase", "GraduationCap", "Lightbulb", "Rocket", "Wrench",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formColor, setFormColor] = useState(DEFAULT_COLOR);
  const [formSaving, setFormSaving] = useState(false);

  // Icon search
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const allIcons = useMemo(() => getIconNames(), []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return popularIcons;
    const q = iconSearch.toLowerCase();
    return allIcons
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [iconSearch, allIcons]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.data.categories);
    } catch {
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormIcon("");
    setFormColor(DEFAULT_COLOR);
    setEditingId(null);
    setShowForm(false);
    setShowIconPicker(false);
    setIconSearch("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (cat: Category) => {
    setFormName(cat.name);
    setFormDescription(cat.description || "");
    setFormIcon(cat.icon || "");
    setFormColor(cat.color || DEFAULT_COLOR);
    setEditingId(cat.id);
    setShowForm(true);
    setShowIconPicker(false);
    setIconSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormSaving(true);
    setError(null);

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        icon: formIcon.trim() || null,
        color: formColor,
      };

      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload);
        setSuccessMsg("Category updated successfully");
      } else {
        await api.post("/admin/categories", payload);
        setSuccessMsg("Category created successfully");
      }

      resetForm();
      fetchCategories();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Something went wrong");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setSuccessMsg("Category deleted");
      setDeleteId(null);
      fetchCategories();
    } catch {
      setError("Failed to delete category");
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.put(`/admin/categories/${cat.id}`, {
        isActive: !cat.isActive,
      });
      fetchCategories();
    } catch {
      setError("Failed to update category");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <FolderOpen className="size-4 text-red-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Categories
            </h1>
          </div>
          <p className="text-sm text-zinc-400 ml-11">
            Manage course categories for the platform
          </p>
        </div>

        <Button
          onClick={openCreateForm}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl px-4 h-10 shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="size-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
          <Check className="size-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
          <X className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">
              {editingId ? "Edit Category" : "New Category"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Web Development"
                maxLength={50}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                {formName.length}/50 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Short description of this category..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all resize-none"
              />
            </div>

            {/* Icon & Color row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Icon (Lucide icon name)
                </label>
                <div className="flex items-center gap-2">
                  {/* Current icon preview */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ backgroundColor: `${formColor}15` }}
                  >
                    {formIcon && isValidIconName(formIcon) ? (
                      <DynamicIcon
                        name={formIcon}
                        className="size-5"
                        style={{ color: formColor }}
                      />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: formColor }}
                      />
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={formIcon}
                      onChange={(e) => {
                        setFormIcon(e.target.value);
                        setShowIconPicker(true);
                      }}
                      onFocus={() => setShowIconPicker(true)}
                      placeholder="e.g. Code, Palette, Globe"
                      className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    {formIcon && !isValidIconName(formIcon) && formIcon.length > 1 && (
                      <p className="text-[10px] text-amber-400 mt-1">
                        Icon &quot;{formIcon}&quot; not found — try another name
                      </p>
                    )}
                    {formIcon && isValidIconName(formIcon) && (
                      <p className="text-[10px] text-emerald-400 mt-1">
                        ✓ Valid icon
                      </p>
                    )}
                  </div>
                </div>

                {/* Icon picker dropdown */}
                {showIconPicker && (
                  <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl p-3 max-h-52 overflow-y-auto">
                    {/* Search within picker */}
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        placeholder="Search icons..."
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                    {!iconSearch && (
                      <p className="text-[10px] text-zinc-600 mb-2 px-1">
                        Popular icons
                      </p>
                    )}
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1">
                      {filteredIcons.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setFormIcon(iconName);
                            setShowIconPicker(false);
                            setIconSearch("");
                          }}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                            formIcon === iconName
                              ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                              : "hover:bg-white/5"
                          }`}
                          title={iconName}
                        >
                          <DynamicIcon
                            name={iconName}
                            className="size-4 text-zinc-300"
                          />
                          <span className="text-[8px] text-zinc-600 truncate w-full text-center">
                            {iconName}
                          </span>
                        </button>
                      ))}
                    </div>
                    {filteredIcons.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">
                        No icons found for &quot;{iconSearch}&quot;
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowIconPicker(false);
                        setIconSearch("");
                      }}
                      className="mt-2 w-full text-[10px] text-zinc-500 hover:text-zinc-300 text-center py-1"
                    >
                      Close picker
                    </button>
                  </div>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        formColor === c
                          ? "border-white scale-110"
                          : "border-transparent hover:border-white/30"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Preview
              </label>
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formColor}20` }}
                >
                  {formIcon && isValidIconName(formIcon) ? (
                    <DynamicIcon
                      name={formIcon}
                      className="size-4"
                      style={{ color: formColor }}
                    />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: formColor }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-white">
                  {formName || "Category Name"}
                </span>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                className="text-zinc-400 hover:text-white rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formSaving || !formName.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl px-5 disabled:opacity-50"
              >
                {formSaving ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : null}
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 text-emerald-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="size-7 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            No categories yet
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Create your first category to organize courses
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-600 font-semibold border-b border-white/5">
            <span className="w-6" />
            <span>Category</span>
            <span>Status</span>
            <span>Order</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`group px-4 sm:px-5 py-3.5 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center gap-4 transition-colors hover:bg-white/2 ${
                  !cat.isActive ? "opacity-50" : ""
                }`}
              >
                {/* Drag handle */}
                <div className="hidden sm:flex">
                  <GripVertical className="size-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>

                {/* Category info */}
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    {cat.icon && isValidIconName(cat.icon) ? (
                      <DynamicIcon
                        name={cat.icon}
                        className="size-[18px]"
                        style={{ color: cat.color }}
                      />
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-zinc-500 truncate max-w-[250px]">
                        {cat.description}
                      </p>
                    )}
                    {cat.icon && (
                      <p className="text-[10px] text-zinc-600 font-mono">
                        {cat.icon}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      cat.isActive
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    }`}
                  >
                    {cat.isActive ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    {cat.isActive ? "Active" : "Hidden"}
                  </button>
                </div>

                {/* Sort order */}
                <div className="hidden sm:block">
                  <span className="text-xs text-zinc-500 font-mono">
                    #{cat.sortOrder}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => openEditForm(cat)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  {deleteId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Confirm delete"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="p-2 rounded-lg text-zinc-500 hover:bg-white/5 transition-colors"
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5">
            <p className="text-xs text-zinc-600">
              {categories.length} {categories.length === 1 ? "category" : "categories"} · {categories.filter((c) => c.isActive).length} active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
