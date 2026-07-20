import "server-only";
import { getCardById } from "@/data/tarot-cards";
import { getSpreadById } from "@/data/spreads";
import {
  READING_CATEGORIES,
  READING_STYLES,
  type DrawnCard,
  type ReadingCategory,
  type ReadingStyle,
} from "@/types/tarot";
import type { DreamInput } from "@/lib/validation/dream";

/**
 * 塔罗解读 Prompt。
 * 输出必须是纯 JSON,与 interpretationSchema 对应。
 */
export function buildTarotSystemPrompt(): string {
  return [
    "你是「星语秘境」的资深塔罗解读师,风格专业、温和、克制。",
    "你的解读原则:",
    "1. 塔罗是自我反思的镜子,不是预言。绝不保证某件事必然发生。",
    "2. 不预测死亡、疾病、灾难;不提供医疗、法律、投资建议;不利用恐惧。",
    "3. 解读要具体结合用户的问题、牌名、正逆位与牌位含义,拒绝空泛套话。",
    "4. 语言使用自然、精致的简体中文。",
    "5. 严格按照要求的 JSON 结构输出,不要输出任何 JSON 以外的内容(包括 markdown 代码块标记)。",
  ].join("\n");
}

export interface TarotPromptInput {
  category: ReadingCategory;
  question: string;
  spreadId: string;
  style: ReadingStyle;
  cards: DrawnCard[];
}

export function buildTarotUserPrompt(input: TarotPromptInput): string {
  const spread = getSpreadById(input.spreadId);
  const cardLines = input.cards
    .map((drawn) => {
      const card = getCardById(drawn.cardId);
      const pos = spread?.positions.find(
        (p) => p.index === drawn.positionIndex,
      );
      if (!card) return "";
      const keywords = drawn.reversed
        ? card.reversedKeywords
        : card.uprightKeywords;
      return [
        `- 牌位${drawn.positionIndex + 1}「${pos?.name ?? ""}」(${pos?.meaning ?? ""})`,
        `牌:${card.name} ${card.nameEn},${drawn.reversed ? "逆位" : "正位"}`,
        `关键词:${keywords.join("、")};牌意:${card.essence}`,
      ].join(" ");
    })
    .join("\n");

  return [
    `占卜领域:${READING_CATEGORIES[input.category].name}`,
    `用户问题:${input.question || "(用户未输入具体问题,请给出当下的综合指引)"}`,
    `牌阵:${spread?.name}(${spread?.nameEn}),共 ${input.cards.length} 张`,
    `解读风格:${READING_STYLES[input.style].name} —— ${READING_STYLES[input.style].description}`,
    "",
    "抽到的牌:",
    cardLines,
    "",
    "请输出以下 JSON 结构(所有字段必填):",
    `{
  "theme": "本次占卜主题,一句话",
  "overview": "整体能量概览,2-4 句",
  "cards": [{ "positionIndex": 数字(与上方牌位序号-1对应), "positionName": "牌位名", "text": "这张牌的详细解读,3-5 句", "keywords": ["关键词"] }],
  "connections": "卡牌之间的关联与呼应,2-4 句",
  "situation": "当前处境分析,2-4 句",
  "obstacles": "潜在阻碍,2-3 句",
  "advice": ["行动建议,2-4 条"],
  "signs": "值得关注的时间或迹象,1-2 句",
  "summary": "一句总结",
  "disclaimer": "一句娱乐性质免责声明"
}`,
  ].join("\n");
}

export function buildDreamSystemPrompt(): string {
  return [
    "你是「星语秘境」的梦境陪伴者,擅长以温和、非诊断的方式帮助用户理解梦境。",
    "原则:",
    "1. 解梦不是医学或心理诊断,你只提供自我觉察的视角。",
    "2. 不下定论,多用「或许」「可能」;不制造恐慌。",
    "3. 语言自然、温和的简体中文。",
    "4. 严格输出要求的 JSON 结构,无其他内容。",
  ].join("\n");
}

export function buildDreamUserPrompt(input: DreamInput): string {
  return [
    `梦境内容:${input.content}`,
    input.when ? `发生时间:${input.when}` : "",
    input.emotion ? `梦中情绪:${input.emotion}` : "",
    `是否重复出现:${input.recurring ? "是" : "否"}`,
    input.people ? `主要人物:${input.people}` : "",
    input.objects ? `关键物品:${input.objects}` : "",
    input.scene ? `梦境场景:${input.scene}` : "",
    input.feeling ? `醒来后的感受:${input.feeling}` : "",
    "",
    "请输出以下 JSON 结构(所有字段必填):",
    `{
  "theme": "梦境主题",
  "keyImages": [{ "image": "意象", "meaning": "可能的含义" }],
  "psychologicalMapping": "可能的心理映射",
  "emotionalState": "当前情绪状态",
  "lifeConnection": "与现实生活的潜在联系",
  "selfInquiry": ["供自我觉察的问题"],
  "gentleAdvice": "温和建议",
  "uncertaintyNote": "不确定性说明"
}`,
  ]
    .filter(Boolean)
    .join("\n");
}
