"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-[rgba(215,180,106,0.12)] bg-[rgba(7,8,18,0.82)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="主导航"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="返回首页"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(215,180,106,0.4)] bg-[rgba(215,180,106,0.08)]">
            <Moon className="h-4.5 w-4.5 text-[#d7b46a] transition-transform duration-500 group-hover:rotate-[-15deg]" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif-cn text-base font-bold tracking-wide text-[#f7f1e7]">
              {siteConfig.name}
            </span>
            <span className="font-display text-[10px] tracking-[0.22em] text-[#d7b46a]/80 uppercase">
              {siteConfig.nameEn}
            </span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <div className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors",
                  active
                    ? "text-[#f2da9c]"
                    : "text-[#b9b4c8] hover:text-[#f7f1e7]",
                )}
              >
                {item.title}
                {active && (
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-[#d7b46a] to-transparent" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="btn-gold-shimmer hidden bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c] sm:inline-flex"
          >
            <Link href="/tarot">
              <Sparkles className="h-4 w-4" />
              开始占卜
            </Link>
          </Button>
          <UserMenu />

          {/* 移动端抽屉 */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-l border-[rgba(215,180,106,0.15)] bg-[#0d0f1e]"
            >
              <SheetHeader>
                <SheetTitle className="font-serif-cn text-left text-[#f7f1e7]">
                  {siteConfig.name}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-col gap-1 px-2">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-[rgba(215,180,106,0.1)] text-[#f2da9c]"
                        : "text-[#b9b4c8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f7f1e7]",
                    )}
                  >
                    <span className="block font-medium">{item.title}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs text-[#b9b4c8]/70">
                        {item.description}
                      </span>
                    )}
                  </Link>
                ))}
                <Button
                  asChild
                  className="btn-gold-shimmer mt-4 bg-[#d7b46a] text-[#1c1608] hover:bg-[#f2da9c]"
                >
                  <Link href="/tarot" onClick={() => setSheetOpen(false)}>
                    <Sparkles className="h-4 w-4" />
                    开始占卜
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
