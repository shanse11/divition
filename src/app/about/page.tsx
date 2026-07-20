import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = { title: "关于与隐私" };
export default function AboutPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-28 pb-20 sm:px-6">
        <section className="glass-card rounded-2xl p-7">
          <h1 className="font-serif-cn text-3xl font-bold text-[#f7f1e7]">
            关于星语秘境
          </h1>
          <p className="mt-4 leading-relaxed text-[#b9b4c8]">
            星语秘境是一款用于娱乐与自我反思的 AI
            神秘学产品。牌面与星座不是决定命运的工具,而是一种帮助你重新观察问题的语言。
          </p>
        </section>
        <section id="privacy" className="glass-card rounded-2xl p-7">
          <h2 className="font-serif-cn text-xl font-bold text-[#f2da9c]">
            隐私说明
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#b9b4c8]">
            <li>你的问题可能被发送到网站管理员配置的 AI 服务以生成解读。</li>
            <li>API 密钥仅保留在服务端,不会发送至浏览器。</li>
            <li>公开分享默认隐藏私人问题,只有获得随机分享链接的人可访问。</li>
            <li>你可以删除历史记录,登录用户可申请导出或删除账号数据。</li>
          </ul>
        </section>
        <section id="disclaimer" className="glass-card rounded-2xl p-7">
          <h2 className="font-serif-cn text-xl font-bold text-[#f2da9c]">
            娱乐免责声明
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#b9b4c8]">
            本站内容不构成医疗、心理、法律、投资或其他专业建议,也不对未来作确定性预测。重要决定请依据现实信息并咨询合格专业人士。
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
