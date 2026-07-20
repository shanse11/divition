import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = { title: "关系占卜" };
const relations = [
  "恋爱关系",
  "暧昧关系",
  "友情",
  "家庭关系",
  "职场关系",
  "与自己的关系",
];
export default function RelationshipPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <header className="text-center">
          <HeartHandshake className="mx-auto h-9 w-9 text-[#d7b46a]" />
          <h1 className="font-serif-cn mt-4 text-3xl font-bold text-[#f7f1e7]">
            关系是一面温柔的镜子
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#b9b4c8]">
            不必填写真实姓名。选择关系类型后,使用关系牌阵看见彼此状态、隐藏阻碍与可实践的建议。
          </p>
        </header>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relations.map((relation) => (
            <Link
              key={relation}
              href="/tarot/reading?category=love&spread=relationship"
              className="glass-card glass-card-hover rounded-2xl p-6"
            >
              <h2 className="font-serif-cn text-lg font-bold text-[#f2da9c]">
                {relation}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#b9b4c8]">
                从我的状态、对方状态、关系现状、隐藏阻碍与未来建议五个角度展开。
              </p>
            </Link>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
