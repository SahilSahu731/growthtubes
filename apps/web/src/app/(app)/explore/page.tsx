"use client";

import { useEffect, useState, useRef } from "react";
import { DynamicIcon, isValidIconName } from "@/components/DynamicIcon";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Compass,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
}

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data.data.categories);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="selection:bg-emerald-500/30">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12 relative">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
              <Compass className="size-4" />
              <span>Explore</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-3">
              Discover your next{" "}
              <span className="text-emerald-400">skill</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl">
              Browse categories, find the perfect course, and start learning
              today. From coding to design, we&apos;ve got you covered.
            </p>
          </div>
        </section>

        {/* Category Slider — YouTube / Fiverr style */}
        <section className="sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto relative">
            {/* Left scroll shadow + button */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
                <div className="w-16 h-full bg-linear-to-r from-zinc-950 to-transparent absolute left-0" />
                <button
                  onClick={() => scroll("left")}
                  className="relative ml-1 w-8 h-8 rounded-full bg-zinc-800/90 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg"
                >
                  <ChevronLeft className="size-4 text-white" />
                </button>
              </div>
            )}

            {/* Scrollable categories */}
            <div
              ref={scrollRef}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none"
            >
              {/* All chip */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  !activeCategory
                    ? "bg-white text-black shadow-lg"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                }`}
              >
                <Sparkles className="size-3.5" />
                All
              </button>

              {/* Trending chip */}
              <button
                onClick={() => setActiveCategory("trending")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === "trending"
                    ? "bg-white text-black shadow-lg"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                }`}
              >
                <TrendingUp className="size-3.5" />
                Trending
              </button>

              {/* Divider */}
              {categories.length > 0 && (
                <div className="w-px h-6 bg-white/10 shrink-0 mx-1" />
              )}

              {/* Dynamic category chips */}
              {isLoading ? (
                <div className="flex items-center gap-2 px-4">
                  <Loader2 className="size-4 animate-spin text-zinc-500" />
                  <span className="text-xs text-zinc-500">Loading...</span>
                </div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === cat.id
                        ? "bg-white text-black shadow-lg"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {cat.icon && isValidIconName(cat.icon) ? (
                      <DynamicIcon
                        name={cat.icon}
                        className="size-3.5"
                        style={{
                          color:
                            activeCategory === cat.id ? "black" : cat.color,
                        }}
                      />
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            activeCategory === cat.id ? "black" : cat.color,
                        }}
                      />
                    )}
                    {cat.name}
                  </button>
                ))
              )}
            </div>

            {/* Right scroll shadow + button */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
                <div className="w-16 h-full bg-linear-to-l from-zinc-950 to-transparent absolute right-0" />
                <button
                  onClick={() => scroll("right")}
                  className="relative mr-1 ml-auto w-8 h-8 rounded-full bg-zinc-800/90 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg"
                >
                  <ChevronRight className="size-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Category cards grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 text-emerald-500 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="size-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 text-base font-medium">
                No categories available yet
              </p>
              <p className="text-zinc-600 text-sm mt-1">
                Check back soon — new categories are being added!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {activeCategory === null
                      ? "Browse all categories"
                      : activeCategory === "trending"
                        ? "Trending categories"
                        : `Courses in ${categories.find((c) => c.id === activeCategory)?.name || "Category"}`}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {categories.length} categories available
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories
                  .filter((cat) => {
                    if (!activeCategory || activeCategory === "trending")
                      return true;
                    return cat.id === activeCategory;
                  })
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 text-left hover:bg-white/3 hover:border-white/10 transition-all duration-300"
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        {cat.icon && isValidIconName(cat.icon) ? (
                          <DynamicIcon
                            name={cat.icon}
                            className="size-6"
                            style={{ color: cat.color }}
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </h3>

                      {/* Description */}
                      {cat.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                          {cat.description}
                        </p>
                      )}

                      {/* CTA */}
                      <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 group-hover:text-emerald-400 transition-colors">
                        <span>Explore</span>
                        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      {/* Color accent bar */}
                      <div
                        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: cat.color }}
                      />
                    </button>
                  ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
