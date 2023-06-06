import { expect, test } from "@playwright/test";

test("basic test", async ({ page }) => {
    await page.goto("/");
    const filterInput = page.locator("#filter-box");
    await filterInput.fill("london");
    await expect(page).toHaveScreenshot();
});
