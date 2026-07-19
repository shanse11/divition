import Link from "next/link";
import { Moon } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";

const footerLinks = [
  {
    title: "探索",
    links: mainNav.map((item) => ({ label: item.title, href: item.href })),
  },
  {
    title: "个人",
    links: [
      { label: "个人中心", href: "/profile" },
      { label: "收藏", href: "/favorites" },
      { label: "设置", href: "/settings" },
      { label: "登录", href: "/login" },
    ],
  },
  {
    title: "了解",
    links: [
      { label: "关于星语秘境", href: "/about" },
      { label: "隐私说明", href: "/about#privacy" },
      { label: "免责声明", href: "/about#disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(215,180,106,0.1)] bg-[rgba(10,11,24,0.6)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(215,180,106,0.4)] bg-[rgba(215,180,106,0.08)]">
                <Moon className="h-4.5 w-4.5 text-[#d7b46a]" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-serif-cn text-base font-bold text-[#f7f1e7]">
                  {siteConfig.name}
                </span>
                <span className="font-display text-[10px] tracking-[0.22em] text-[#d7b46a]/80 uppercase">
                  {siteConfig.nameEn}
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#b9b4c8]">
              在星空与牌面之间,聆听你早已知晓的答案。所有内容仅供娱乐与自我探索,不构成任何专业建议。
            </p>
          </div>
          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="font-serif-cn text-sm font-bold text-[#f2da9c]">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#b9b4c8] transition-colors hover:text-[#f7f1e7]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-[rgba(215,180,106,0.08)] pt-6 text-center">
          <p className="text-xs text-[#b9b4c8]/70">
            © {new Date().getFullYear()} {siteConfig.name} {siteConfig.nameEn}
            。占卜内容由 AI 生成,仅供娱乐,请勿作为医疗、法律或投资依据。
          </p>
        </div>
      </div>
    </footer>
  );
}
