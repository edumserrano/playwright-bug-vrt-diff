- [Playwright bug - Visual Regression Testing (VRT) diff](#playwright-bug---visual-regression-testing-vrt-diff)
  - [How to run the app and tests](#how-to-run-the-app-and-tests)
  - [Issues trying to get consistent VRT](#issues-trying-to-get-consistent-vrt)
    - [Hardware accelaration and headless mode](#hardware-accelaration-and-headless-mode)
    - [Chromium screenshot in Windows vs Chromium screenshot in Ubuntu](#chromium-screenshot-in-windows-vs-chromium-screenshot-in-ubuntu)
    - [Differences when running the test in/out of debug mode](#differences-when-running-the-test-inout-of-debug-mode)
  - [Notes](#notes)

# Playwright bug - Visual Regression Testing (VRT) diff

This is a demo repo to check potential bugs in playwright regarding Visual Regression Testing (VRT).

The repo consists of an Angular app running playwright tests. The aim is to run VRT tests consistently.

## How to run the app and tests

Run `npm run start` from the root of the repo to start the app. It will run `ng serve` and open the browser. 

Run `npm run test` from the root of the repo to run the tests. It will run the `playwright test` command.

## Issues trying to get consistent VRT

> **Note**
> All these scenarios were executed from a Windows OS as the base OS.

### Hardware accelaration and headless mode

- Go to the root of the repo.
- Run the tests via `npm run test`.
- Run the app via `npm run start`.
- Compare the screenshot generated via `npm run test` at `tests/example.spec.ts-snapshots/basic-test-1-chromium-win32.png` with how the app running via `npm run start` looks like in regards to the blur effect.

<details>
  <summary>Screenshot from npm run test</summary>
  
  ![screenshot from npm run test](/docs/images/hardware-acceleration-npm-run-test.png)
</details>

<details>
  <summary>Screenshot from npm run start</summary>
  
  > **Note**
  > My PC has a higher resolution than 1920x1080, I've used the browser tools to try and get close for the manual screenshot I took. Anyways, what's important in this screenshot is looking at how the blur looks correct and how different it is from when running the test via `npm run test`.
  > 

  ![screenshot from npm run test](/docs/images/hardware-acceleration-npm-run-start.png)
</details>

When running the tests with `npm run test` it seems the chromium browser running in `headless` mode does not have hardware acceleration enabled, therefore the image produced is not as expected.

You can compare the image produced from the test with how the app looks like when running via `npm run start`. I believe this is related with hardware acceleration because when running the app via `npm run start` if you enable/disable hardware accelearation in the browser settings, the blur applied looks different.

Another way to view this is related with hardware acceleration is that if you add:
```ts
launchOptions: {
  args: ["--disable-gpu"],
},
```
to the chromium project settings in the [playwright.config.ts](/playwright.config.ts) file, then the blur of screenshot from debug will look equal to when running without debug.

> **Note**
> The way the blur is intended to look like is how it looks when hardware acceleration is enabled
>
> The blur effect is being created with:
> ```css
> background-color: transparent;
> -webkit-backdrop-filter: blur(50px);
> backdrop-filter: blur(50px);
> ```
>

### Chromium screenshot in Windows vs Chromium screenshot in Ubuntu

- Go to the root of the repo.
- Uncomment the line `// ignoreDefaultArgs: ["--hide-scrollbars"]` in the [playwright.config.ts](/playwright.config.ts) file.
- Run the tests via `npm run test` and generate the screenshot in Windows.
- Duplicate the screenshot `basic-test-1-chromium-win32.png` at `/tests/example.spec.ts-snapshots` and rename it to `basic-test-1-chromium-linux.png`.
- Run the tests in Ubuntu via docker by executing `docker run -it --rm --ipc=host --workdir=/app -v ${PWD}:/app mcr.microsoft.com/playwright:v1.34.3-jammy npx playwright test`.
- Open the html report via `npx playwright show-report tests/test-results/reporters/html` and look at the differences in the screenshots.

The screenshot generated from Ubuntu will have some slight differences regarding the font (looks bolder in windows?). Furthermore, the page scrollbar on Windows is a bit wider than the one in Ubuntu.

<details>
  <summary>Diff</summary>
  
  ![diff](/docs/images/windows-ubuntu-diff.png)
</details>

<details>
  <summary>Screenshot from Windows</summary>
  
  ![Windows](/docs/images/windows.png)
</details>

<details>
  <summary>Screenshot from Ubuntu</summary>
  
  ![Ubuntu](/docs/images/ubuntu.png)
</details>

> **Note**
> The font I'm using on the app is [Lato Regular 400 from google fonts](https://fonts.google.com/specimen/Lato?preview.text=Whereas%20recognition%20of%20the%20inherent%20dignity&preview.text_type=custom). 
>  
> See the below at [index.html](/src/index.html):
> 
> ```html
> <link rel="preconnect" href="https://fonts.googleapis.com">
> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
> <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet">
> ```
> 
> And CSS at [styles.less](/src/styles/styles.less):
> 
> ```css
> @font-family-lato: 'Lato', sans-serif;
> 
> body {
>   font-family: @font-family-lato;
> }
> ```

### Differences when running the test in/out of debug mode 

This one might not be a bug but it still feels like a bit of an issue.

- Install the [playwright extension for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright).
- Go to the root of the repo.
- Uncomment the line `// ignoreDefaultArgs: ["--hide-scrollbars"]` in the [playwright.config.ts](/playwright.config.ts) file.
- Generate the test screenshot by running the tests with `npm run test`. 
- Go to VS Code and debug the test using the playwright extension for VS Code.
- Open the html report via `npx playwright show-report tests/test-results/reporters/html` and look at the differences in the screenshots.

The debug will fail because there are differences in the screenshots:

- the screenshot from debug mode will have will have the appropriate blur. Perhaps it runs with hardware acceleration enabled and therefore shows as expected (equal to what is visible when running the app with `npm run start`).
- the screenshot from debug mode will have slight differences in the font. Or perhaps this is incorrect, perhaps the issue is not with the font but with the fact that the scrollbar width is slightly different and the effect that the difference in blur also has on the fonts.
- the screenshot from debug mode seems to have "weaker" coloured red line (the red line below the label `Where do you study or work?`). This again might just be related with the blur difference.
- the screenshot from debug mode has a scrollbar with smaller width.

<details>
  <summary>Diff</summary>
  
  ![diff](/docs/images/debug-diff.png)
</details>

<details>
  <summary>Screenshot from running via "npm run test"</summary>
  
  ![Windows](/docs/images/not-debug.png)
</details>

<details>
  <summary>Screenshot from running in debug via VS Code playwright extension</summary>
  
  ![Ubuntu](/docs/images/debug.png)
</details>

> **Note**
> To make the comparison easier in debug vs not debug I've added `ignoreDefaultArgs: ["--hide-scrollbars"]` in the [playwright.config.ts](/playwright.config.ts) file. This makes sure scrollbar is always visible whether running the test in debug mode or not. 
>
> However I'd say that this was also unexpected to me even if it's default behavior. Couldn't find any mention to the fact that the scrollbar is disabled in headless mode when searching the [playwright docs](https://playwright.dev/docs). Perhaps a chance for improving the docs?
> 

## Notes

- The code of the app has been stripped down to a minimum to reproduce the issue with code coverage so it might not make much sense. The code itself is irrelevant, what matters is understanding why the screenshots aren't equal in the above described scenarios.
