import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import {
  READING_CATEGORIES,
  type DrawnCard,
  type ReadingCategory,
  type ReadingStyle,
} from "@/types/tarot";
import type {
  CardInterpretationItem,
  Interpretation,
  ResearchContext,
} from "@/types/reading";

export const DISCLAIMER =
  "本解读由 AI 生成,仅供娱乐与自我反思,不构成医疗、法律、投资等专业建议。未来始终掌握在你自己手中。";

export interface LocalInterpretationInput {
  category: ReadingCategory;
  question: string;
  spreadId: string;
  style: ReadingStyle;
  cards: DrawnCard[];
  research?: ResearchContext;
}

const STYLE_OPENERS: Record<ReadingStyle, string> = {
  gentle: "亲爱的,让我们慢慢看这副牌想对你说什么。",
  rational: "我们按照牌面信息,逐层拆解当前的局面。",
  poetic: "星光落定,牌面如夜空中的岛屿,逐一亮起。",
  direct: "直接说结论前,先看牌面给出的事实。",
  brief: "以下是本次牌面的核心要点。",
  deep: "这是一副值得慢慢展开的牌,我们从整体的能量场开始。",
};

/** 基于牌面数据的确定性本地解读,作为无 AI 时的兜底 */
export function generateLocalInterpretation(
  input: LocalInterpretationInput,
): Interpretation {
  const spread = getSpreadById(input.spreadId);
  const categoryName = READING_CATEGORIES[input.category]?.name ?? "综合指引";

  const items: CardInterpretationItem[] = input.cards.map((drawn) => {
    const card = getCardById(drawn.cardId);
    const position = spread?.positions.find(
      (p) => p.index === drawn.positionIndex,
    );
    if (!card) {
      return {
        positionIndex: drawn.positionIndex,
        positionName: position?.name ?? `第 ${drawn.positionIndex + 1} 张`,
        text: "这张牌的信息暂时无法读取。",
        keywords: [],
      };
    }
    const keywords = drawn.reversed
      ? card.reversedKeywords
      : card.uprightKeywords;
    const orientation = drawn.reversed ? "逆位" : "正位";
    const posMeaning = position
      ? `在「${position.name}」的位置上(${position.meaning}),`
      : "";
    return {
      positionIndex: drawn.positionIndex,
      positionName: position?.name ?? `第 ${drawn.positionIndex + 1} 张`,
      keywords,
      text:
        `${posMeaning}你抽到了${orientation}的「${card.name}」(${card.nameEn})。` +
        `这张牌的核心是「${card.essence}」。${orientation}时,它带来的讯息围绕着${keywords.join("、")}。` +
        (drawn.reversed
          ? "逆位并非坏事,它更像一面镜子,提醒你留意这股能量目前受阻或向内的状态。"
          : "这股能量当前是顺畅流动的,值得你有意识地借用它。"),
    };
  });

  const majorCount = input.cards.filter((c) =>
    c.cardId.startsWith("major"),
  ).length;
  const reversedCount = input.cards.filter((c) => c.reversed).length;
  const total = input.cards.length;

  const energyNote =
    majorCount > total / 2
      ? "大阿尔卡纳的比例很高,说明这件事对你而言分量不轻,背后可能有更长期的人生课题在运作。"
      : "牌面以日常能量为主,说明局面更多取决于具体的行动与选择,而非不可控的大势。";

  const reversedNote =
    reversedCount === 0
      ? "全部正位,整体能量顺畅,是一个适合行动的信号。"
      : reversedCount > total / 2
        ? "逆位偏多,提示当前有不少能量在向内收敛或受阻,不妨放慢节奏,先整理再出发。"
        : "正逆位交错,局面既有支持也有功课,关键在于分辨哪些该推进、哪些该等待。";

  const firstCard = getCardById(input.cards[0]?.cardId ?? "");
  const lastCard = getCardById(
    input.cards[input.cards.length - 1]?.cardId ?? "",
  );

  return {
    theme: input.question
      ? `关于「${input.question}」的${categoryName}占卜`
      : `${categoryName} · ${spread?.name ?? "塔罗"}指引`,
    overview: `${STYLE_OPENERS[input.style]} 本次${spread?.name ?? "牌阵"}共 ${total} 张牌,其中 ${majorCount} 张大阿尔卡纳、${reversedCount} 张逆位。${energyNote}`,
    cards: items,
    connections:
      total > 1 && firstCard && lastCard
        ? `从起点的「${firstCard.name}」到收尾的「${lastCard.name}」,牌面呈现出一条从「${firstCard.essence}」走向「${lastCard.essence}」的路径。中间的牌是这段路上的风景与关卡,它们彼此呼应,而非孤立存在。`
        : "单张牌的讯息本身就是完整的,它以最凝练的方式回应你的问题。",
    situation: `就${categoryName}而言,${reversedNote}`,
    obstacles:
      reversedCount > 0
        ? `留意逆位牌所指向的部分——${items
            .filter((_, i) => input.cards[i]?.reversed)
            .map((i) => `「${i.positionName}」中的${i.keywords[0] ?? ""}`)
            .join(",")}。这些是当前最值得温柔面对的功课。`
        : "牌面没有显示明显的阻碍,更多是提醒你保持当前的节奏,不因顺利而松懈。",
    advice: [
      "把牌面关键词与你的真实处境对照,找出最触动你的那一个词。",
      reversedCount > 0
        ? "对逆位提示的领域,先观察和整理,而不是急着行动。"
        : "能量顺畅时,把想了很久的事排进本周的日程。",
      "无论牌面如何,最终的选择权始终在你手中。",
    ],
    signs:
      "接下来的一到两周,留意与牌面关键词呼应的人、对话或机会——它们往往是提醒你回到这次思考的信号。",
    summary: firstCard
      ? `记住「${firstCard.name}」带来的讯息:${firstCard.essence}。`
      : "答案不在牌里,而在你看牌时心里浮现的那个念头。",
    disclaimer: DISCLAIMER,
    ...(input.research
      ? {
          research: input.research,
          tarotPerspective:
            "牌面在这里仅提供象征性的观察：把关键词对应到你可验证的准备、选择和心理预期，而不是把它当作事实或结果预测。",
        }
      : {}),
  };
}
