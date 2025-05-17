"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export function MobileNav({ navigation, isActive }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t py-2 px-4">
      <div className="flex justify-around items-center">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md",
              isActive(item.href) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div className={cn("p-1 rounded-full", isActive(item.href) ? "bg-primary/10" : "")}>{item.icon}</div>
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
