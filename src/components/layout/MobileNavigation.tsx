"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, MoonStar, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "首页", href: "/", icon: Home },
  { title: "塔罗", href: "/tarot", icon: Sparkles },
  { title: "今日", href: "/daily", icon: Sun },
  { title: "星座", href: "/zodiac", icon: MoonStar },
  { title: "记录", href: "/history", icon: History },
] as const;

/** 移动端底部导航,处理 iOS 安全区域 */
export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="底部导航"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(215,180,106,0.14)] bg-[rgba(10,11,24,0.92)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                active ? "text-[#f2da9c]" : "text-[#b9b4c8]",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(242,218,156,0.6)]")}
              />
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
