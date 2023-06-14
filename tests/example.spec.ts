import { expect, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";

test("this shows attachments well", async ({ page }) => {
  if (test.info().project.name === "chromium") {
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage(),
    ]);
  }

  try {
    await page.goto("/");
    const filterInput = page.locator("#filter-box");
    await filterInput.fill("london");
    await expect(page).toHaveScreenshot();
  } finally {
    if (test.info().project.name === "chromium") {
      const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
      ]);
      const coverageList = [...jsCoverage, ...cssCoverage];
      const _ = await attachCoverageReport(coverageList, test.info(), {
        sourceFilter: (sourceName: any) => sourceName.search(/src\//u) !== -1,
      });
    }
  }
});

test("this only shows code coverage", async ({ page }) => {
  if (test.info().project.name === "chromium") {
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage(),
    ]);
  }

  await page.goto("/");
  const filterInput = page.locator("#filter-box");
  await filterInput.fill("london");

  if (test.info().project.name === "chromium") {
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);
    const coverageList = [...jsCoverage, ...cssCoverage];
    const _ = await attachCoverageReport(coverageList, test.info(), {
      sourceFilter: (sourceName: any) => sourceName.search(/src\//u) !== -1,
    });
  }

  await expect(page).toHaveScreenshot();
});

test("this does not show any attachment", async ({ page }) => {
  await page.goto("/");
  const filterInput = page.locator("#filter-box");
  await filterInput.fill("london");
  await expect(page).toHaveScreenshot();
});
