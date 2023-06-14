import { expect, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";

test("basic test", async ({ page }) => {
    if (test.info().project.name === "chromium") {
        await Promise.all([
            page.coverage.startJSCoverage(),
            page.coverage.startCSSCoverage(),
        ]);
    }
    
    await page.goto("/");
    const filterInput = page.locator("#filter-box");
    await filterInput.fill("london");
    await expect(page).toHaveScreenshot();

    if (test.info().project.name === "chromium") {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];

        // if the line below to attach the code coverage report is uncommented then both the snapshots
        // and the code coverage is displayed.

        // const _ = await attachCoverageReport(coverageList, test.info(), {
        //     sourceFilter: (sourceName: any) => sourceName.search(/src\//u) !== -1,
        // });
    }
});
