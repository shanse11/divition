import type { DreamInterpretation } from "@/lib/ai/schema";
import type { DreamInput } from "@/lib/validation/dream";

/** 常见梦境意象的温和释义库 */
const IMAGE_LIBRARY: Array<{
  pattern: RegExp;
  image: string;
  meaning: string;
}> = [
  {
    pattern: /飞|翱翔|漂浮/,
    image: "飞翔",
    meaning: "或许对应着对自由的渴望,或想要摆脱某种现实束缚的心情",
  },
  {
    pattern: /坠落|掉下|跌/,
    image: "坠落",
    meaning: "可能映射着失控感,或对某件事情缺乏安全感",
  },
  {
    pattern: /追|逃|跑/,
    image: "追逐",
    meaning: "常与压力有关——现实中或许有你一直回避、却始终跟随的事",
  },
  {
    pattern: /水|海|河|雨|湖/,
    image: "水",
    meaning: "水常与情绪相连;它的平静或汹涌,可能正是你情绪的样子",
  },
  {
    pattern: /牙|牙齿/,
    image: "牙齿",
    meaning: "有人将其与失去、形象焦虑或表达受阻联系在一起",
  },
  {
    pattern: /考试|迟到|来不及/,
    image: "考试与迟到",
    meaning: "多与自我要求和担心辜负期待有关",
  },
  {
    pattern: /死|去世|葬/,
    image: "死亡意象",
    meaning: "在梦里往往象征结束与转化,而非字面含义——某个阶段可能正在落幕",
  },
  {
    pattern: /蛇/,
    image: "蛇",
    meaning: "既可能代表恐惧或压力源,也常被视为转化与生命力的象征",
  },
  {
    pattern: /房子|房间|家/,
    image: "房屋",
    meaning: "常被看作自我的映射;房间的明暗,或许对应你心里不同的角落",
  },
  {
    pattern: /迷路|找不到/,
    image: "迷路",
    meaning: "可能对应着现实中的方向感缺失,或面对选择的犹疑",
  },
];

/** 本地解梦模板,AI 不可用时使用 */
export function generateLocalDreamReading(
  input: DreamInput,
): DreamInterpretation {
  const matched = IMAGE_LIBRARY.filter((item) =>
    item.pattern.test(input.content),
  ).slice(0, 4);

  const keyImages =
    matched.length > 0
      ? matched.map(({ image, meaning }) => ({ image, meaning }))
      : [
          {
            image: "梦境整体",
            meaning:
              "这个梦的意象比较个人化,它的含义或许只有对照你自己的生活才能显现",
          },
        ];

  const emotionNote = input.emotion
    ? `你提到梦中的情绪是「${input.emotion}」,这份感受本身就值得被认真对待——梦里的情绪往往比情节更诚实。`
    : "你没有特别描述梦中的情绪,不妨回想一下:醒来那一刻,心里残留的是什么感觉?";

  const recurringNote = input.recurring
    ? "这个梦重复出现,通常说明它背后的主题尚未被真正看见或处理。它会一直温和地敲门,直到你愿意开门。"
    : "";

  return {
    theme:
      matched.length > 0
        ? `与「${matched[0].image}」有关的梦`
        : "一个来自潜意识的讯息",
    keyImages,
    psychologicalMapping: `梦境常常把白天来不及消化的感受,编织成夜里的画面。${recurringNote}这个梦或许在替你表达某些清醒时不便言说的部分。`,
    emotionalState: emotionNote,
    lifeConnection:
      "试着把梦里最强烈的画面,与最近一两周的生活并排放在一起——一次对话、一个决定、一件悬而未决的事。联系往往在并置时自己浮现。",
    selfInquiry: [
      "梦里最让你在意的画面,让你想起现实中的什么?",
      "如果这个梦是一封信,它最想提醒你哪件事?",
      "醒来后的那种感受,最近在白天也出现过吗?",
    ],
    gentleAdvice:
      "睡前给自己十分钟不看屏幕的安静时间,把心里挂着的事写下来。被写下的念头,常常就不再需要入梦。",
    uncertaintyNote:
      "梦的含义没有标准答案,以上只是供你参考的视角。解梦不是医学或心理诊断,如果梦境长期影响睡眠与情绪,建议寻求专业帮助。",
  };
}
