"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 导航栏用户入口。登录体系接入后会展示头像与下拉菜单。 */
export function UserMenu() {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label="登录或查看个人中心"
    >
      <Link href="/login">
        <UserRound className="h-5 w-5 text-[#b9b4c8]" />
      </Link>
    </Button>
  );
}
