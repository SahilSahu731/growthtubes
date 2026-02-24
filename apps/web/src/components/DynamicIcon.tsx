"use client";

import { icons, type LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

/**
 * Renders a Lucide icon by its PascalCase name (e.g. "Code", "Palette", "Globe").
 * Falls back to a colored dot if the icon name is not found.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = icons[name as keyof typeof icons];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
}

/**
 * Check if a given name is a valid Lucide icon name
 */
export function isValidIconName(name: string): boolean {
  return name in icons;
}

/**
 * Get a list of all available icon names
 */
export function getIconNames(): string[] {
  return Object.keys(icons);
}
