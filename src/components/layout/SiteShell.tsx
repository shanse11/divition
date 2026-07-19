import { MysticalBackground } from "@/components/background/MysticalBackground";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

interface SiteShellProps {
  children: React.ReactNode;
  /** 是否显示底部移动导航 */
  mobileNav?: boolean;
}

/** 页面通用外壳:背景 + 导航 + Footer + 移动端底部导航 */
export function SiteShell({ children, mobileNav = true }: SiteShellProps) {
  return (
    <>
      <MysticalBackground />
      <Navbar />
      <div className="flex-1 pb-16 lg:pb-0">{children}</div>
      <Footer />
      {mobileNav && <MobileNavigation />}
    </>
  );
}
