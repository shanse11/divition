import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

async function expectDialogsInViewport(page: import("@playwright/test").Page) {
  for (const dialog of await page.getByRole("dialog").all()) {
    const box = await dialog.boundingBox();
    if (!box) continue;
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport!.height + 1);
  }
}

test.describe("public pages", () => {
  test("home renders the primary navigation and deterministic visual baseline", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/星语秘境/);
    await expect(
      page.getByRole("link", { name: "开始占卜" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "抽取今日之牌" }).first(),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (test.info().project.name === "desktop-chromium") {
      await expect(page).toHaveScreenshot("home.png", { fullPage: true });
    }
  });

  test("daily reading is stable across a refresh", async ({ page }) => {
    await page.goto("/daily");
    await expect(page.getByText("本月星轨")).toBeVisible();
    const cardHeading = page
      .locator("section h2")
      .filter({ hasText: /正位|逆位/ })
      .first();
    const card = await cardHeading.textContent();
    await page.reload();
    await expect(page.getByText("本月星轨")).toBeVisible();
    await expect(cardHeading).toHaveText(card!);
    await expectNoHorizontalOverflow(page);
  });

  test("zodiac birth date selects a sign and forecast period", async ({
    page,
  }) => {
    await page.goto("/zodiac");
    await page.locator("#birthDate").fill("1990-04-15");
    await page.getByRole("button", { name: "找到我的星座" }).click();
    await expect(page).toHaveURL(/\/zodiac\?sign=aries&birthDate=1990-04-15/);
    await expect(page.getByRole("link", { name: "本周" })).toBeVisible();
    await page.getByRole("link", { name: "本周" }).click();
    await expect(page).toHaveURL(/period=week/);
    await expectNoHorizontalOverflow(page);
  });

  test("dream form validates short entries and returns a mock result", async ({
    page,
  }) => {
    await page.goto("/dream");
    const submit = page.getByRole("button", { name: "开始解梦" });
    await expect(submit).toBeDisabled();
    await page.locator("#dream-content").fill("昨夜我梦见一片宁静的海洋");
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page).toHaveURL(/\/dream\/[^/]+$/);
    await expect(page.getByRole("button", { name: "保存修改" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("auth, history, and settings routes are available without credentials", async ({
    page,
  }) => {
    for (const route of ["/login", "/register", "/history", "/settings"]) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("main")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
    await expect(
      page.getByText("登录后可保存偏好并管理账号数据。"),
    ).toBeVisible();
  });

  test("tarot completes a single-card reading through the mock provider", async ({
    page,
  }) => {
    await page.goto("/tarot/reading");
    await page
      .getByRole("button")
      .filter({ hasText: /爱情|事业|综合/ })
      .first()
      .click();
    await page.getByLabel("占卜问题").fill("接下来一个月我最需要留意什么？");
    await page.getByRole("button", { name: "下一步" }).click();
    const spread = page.getByRole("button", { name: /单牌指引/ });
    await spread.click();
    await expect(spread).toHaveAttribute("aria-pressed", "true");
    await expect(spread).toHaveClass(/ring-2/);
    await page.getByRole("button", { name: "下一步" }).click();
    const style = page
      .getByRole("button", { name: /温柔|理性|诗意/ })
      .first();
    await style.click();
    await expect(style).toHaveAttribute("aria-pressed", "true");
    await expect(style).toHaveClass(/ring-2/);
    await page.getByRole("button", { name: "开始洗牌", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("深呼吸");
    await page.getByRole("button", { name: "开始洗牌", exact: true }).click();
    await page.getByRole("button", { name: "选择第1叠牌" }).click();
    await page
      .getByRole("button", { name: "抽取第1张牌" })
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByText("已选 1 / 1 张")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("牌面正在翻开", {
      timeout: 5_000,
    });
    await page.getByRole("button", { name: "聆听解读" }).click();
    await expect(page).toHaveURL(/\/tarot\/result\/[^/]+$/, {
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: "收藏" })).toBeVisible();
    await page.getByRole("button", { name: "分享" }).click();
    await expect(
      page.getByRole("dialog", { name: "分享这次星语" }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: "显示我的问题（私人内容）" }),
    ).not.toBeChecked();
    await page.getByRole("button", { name: "生成并复制链接" }).click();
    await expect(page.getByText("查看分享：")).toBeVisible({ timeout: 10_000 });
    const shareUrl = await page.getByText("查看分享：").textContent();
    expect(shareUrl).toMatch(/\/share\//);
    await expectDialogsInViewport(page);
    await expectNoHorizontalOverflow(page);
  });
});
