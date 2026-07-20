import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("请输入有效的邮箱地址").max(200),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .max(72, "密码最长 72 位")
    .regex(/[a-zA-Z]/, "密码需包含字母")
    .regex(/\d/, "密码需包含数字"),
  nickname: z.string().trim().min(1, "请输入昵称").max(20, "昵称最长 20 字"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("请输入有效的邮箱地址").max(200),
  password: z.string().min(1, "请输入密码").max(72),
});

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "请输入有效日期")
  .refine(
    (value) => value <= new Date().toISOString().slice(0, 10),
    "出生日期不能晚于今天",
  );

export const profileSchema = z
  .object({
    nickname: z.string().trim().min(1, "请输入昵称").max(20).optional(),
    bio: z.string().trim().max(200).optional(),
    birthDate: birthDateSchema.nullable().optional(),
    avatarSeed: z.string().trim().min(1, "请输入头像种子").max(30).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "请至少修改一项资料");

export const settingsSchema = z
  .object({
    defaultStyle: z
      .enum(["gentle", "rational", "poetic", "direct", "brief", "deep"])
      .optional(),
    motionLevel: z.enum(["full", "reduced"]).optional(),
    musicEnabled: z.boolean().optional(),
    musicVolume: z.number().int().min(0).max(100).optional(),
    shareShowQuestion: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "请至少修改一项设置");

export const accountDeleteSchema = z.object({
  confirmation: z.literal("删除我的账号"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
