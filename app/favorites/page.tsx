"use client";

import CommandCard from "@/components/CommandCard";
import { useVariables } from "@/components/VariablesProvider";
import { getAllCommands } from "@/lib/commands";

const allCommands = getAllCommands();

export default function FavoritesPage() {
  const { favorites } = useVariables();
  const items = allCommands.filter((command) => favorites.includes(command.id));

  return (
    <div className="space-y-4">
      <header className="color-panel rounded-md p-4">
        <h1 className="font-heading text-3xl text-gradient-brand">Favorites</h1>
        <p className="text-sm text-dim">
          <span className="text-post">{items.length}</span> saved commands
        </p>
      </header>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.id}-${item.section}`}>
            <p className="mb-1 text-xs text-dim">{item.section} / {item.group}</p>
            <CommandCard command={item} />
          </div>
        ))}
        {items.length === 0 ? <p className="text-dim">No favorites yet. Click the star icon on command cards.</p> : null}
      </div>
    </div>
  );
}
