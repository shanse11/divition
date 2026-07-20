"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getZodiacByBirthDate, type ZodiacId } from "@/data/zodiac";

const birthDateSchema = z.object({
  birthDate: z
    .string()
    .refine(
      (value) => getZodiacByBirthDate(value) !== null,
      "请输入有效的出生日期",
    ),
});
type BirthDateValues = z.infer<typeof birthDateSchema>;

export function BirthDateSelector({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const form = useForm<BirthDateValues>({
    resolver: zodResolver(birthDateSchema),
    defaultValues: { birthDate: initialDate ?? "" },
  });
  function submit(values: BirthDateValues) {
    const sign = getZodiacByBirthDate(values.birthDate);
    if (!sign) return;
    const params = new URLSearchParams({
      sign: sign.id as ZodiacId,
      birthDate: values.birthDate,
    });
    router.push(`/zodiac?${params.toString()}`);
  }
  return (
    <form
      onSubmit={form.handleSubmit(submit)}
      className="glass-card mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <label htmlFor="birthDate" className="sr-only">
          出生日期
        </label>
        <Input
          id="birthDate"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          className="h-10"
          aria-invalid={Boolean(form.formState.errors.birthDate)}
          {...form.register("birthDate")}
        />
        {form.formState.errors.birthDate && (
          <p className="mt-1 text-xs text-[#d26a6a]">
            {form.formState.errors.birthDate.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="h-10 px-5">
        找到我的星座
      </Button>
    </form>
  );
}
