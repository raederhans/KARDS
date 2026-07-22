#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const host = "127.0.0.1";
const port = 5184;
const appUrl = `http://${host}:${port}`;
const outputRoot = path.resolve(".runtime/kards-editor-quality-smoke/latest");
const reportPath = path.join(outputRoot, "report.json");
const viteCliPath = path.resolve("node_modules/vite/bin/vite.js");
let activeReport = null;

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  await fs.mkdir(outputRoot, { recursive: true });
  const server = startDevServer();
  const report = {
    generatedAt: new Date().toISOString(),
    appUrl,
    scope: "Undo/Redo, appearance preset, diff explanation, keyboard contracts, and Canvas text alternative",
    ok: false,
    checks: [],
    errors: [],
  };
  activeReport = report;

  try {
    await waitForServer(server);
    await runBrowserChecks(report);
    report.ok = true;
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await stopDevServer(server);
    await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, reportPath }, null, 2));
  }
}

function startDevServer() {
  const output = [];
  const child = spawn(
    process.execPath,
    [viteCliPath, "--host", host, "--port", String(port), "--strictPort"],
    {
      cwd: process.cwd(),
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  return { child, output };
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(`Vite exited before startup.\n${server.output.join("")}`);
    }
    try {
      const response = await fetch(appUrl, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // Startup polling is expected to fail until Vite is ready.
    }
    await delay(250);
  }
  throw new Error(`Vite did not become ready at ${appUrl}.\n${server.output.join("")}`);
}

async function runBrowserChecks(report) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => window.localStorage.clear());
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") report.errors.push(`console: ${message.text()}`);
    });
    const response = await page.goto(appUrl, { waitUntil: "domcontentloaded" });
    if (!response?.ok()) {
      throw new Error(`Editor navigation failed with HTTP ${response?.status() ?? "unknown"}`);
    }
    const title = page.locator('input[name="card-title"]');
    await title.waitFor({ state: "visible" });
    if ((await page.locator("html").getAttribute("lang")) !== "en") {
      await page.locator("button.language-toggle").click();
      await page.waitForFunction(() => document.documentElement.lang === "en");
    }

    const undo = page.locator('button[aria-keyshortcuts="Control+Z Meta+Z"]');
    const redo = page.locator('button[aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"]');
    const initialTitle = await title.inputValue();
    await assert(await undo.isDisabled(), "Undo starts disabled for a clean editor");
    await title.fill("Runtime history title");
    await assert(await undo.isEnabled(), "Editing enables Undo");
    await undo.click();
    await assert((await title.inputValue()) === initialTitle, "Undo restores the previous title");
    await redo.focus();
    await page.keyboard.press("Control+Shift+Z");
    await assert((await title.inputValue()) === "Runtime history title", "Keyboard Redo restores the edit");
    await page.keyboard.press("Shift+Tab");
    await assert(
      await undo.evaluate((element) => element === document.activeElement),
      "Keyboard navigation reaches Undo",
    );
    const focusStyle = await undo.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
    });
    await assert(
      focusStyle.outlineStyle !== "none" && focusStyle.outlineWidth !== "0px",
      "History controls have a visible focus outline",
    );
    await page.keyboard.press("Control+Z");
    await assert((await title.inputValue()) === initialTitle, "Keyboard Undo works outside text fields");
    await redo.click();
    const textUndoPrevented = await title.evaluate((element) => {
      const event = new KeyboardEvent("keydown", {
        key: "z",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      return !element.dispatchEvent(event);
    });
    await assert(!textUndoPrevented, "Text fields keep their native Undo keyboard behavior");

    await page.locator('select[name="appearance-preset"]').selectOption("clear-reading");
    await page.getByRole("button", { name: "Apply appearance preset" }).click();
    const textureIntensity = page.locator('input[name="card-texture-intensity"]');
    await assert((await textureIntensity.inputValue()) === "0.45", "Appearance preset updates serialized controls");
    await undo.click();
    await assert((await textureIntensity.inputValue()) === "1.85", "Appearance preset is one Undo step");
    await redo.click();

    const canvas = page.locator("canvas.card-canvas");
    await assert(
      (await canvas.getAttribute("aria-describedby")) === "card-preview-summary canvas-hint",
      "Canvas references its readable summary and input hint",
    );
    await assert(
      (await page.locator("#card-preview-summary").textContent())?.includes("Runtime history title"),
      "Canvas text alternative reflects current card content",
    );

    const appearanceTab = page.getByRole("tab", { name: "Appearance" });
    await appearanceTab.focus();
    await page.keyboard.press("ArrowRight");
    await assert(
      await page.getByRole("tab", { name: "Library" }).evaluate((element) => element === document.activeElement),
      "Workbench tabs move focus with ArrowRight",
    );

    await page.getByRole("tab", { name: "Reference" }).click();
    const comparisonImage = await canvas.screenshot({ type: "png" });
    await page.locator('input[name="reference-card-image"]').setInputFiles({
      name: "current-preview.png",
      mimeType: "image/png",
      buffer: comparisonImage,
    });
    await page.getByText("Channel threshold: 12").waitFor();
    await assert(await page.getByText("Review level").isVisible(), "Diff exposes a textual review level");
    await assert(await page.locator(".diff-locator[role=img]").isVisible(), "Diff exposes a locatable changed area");

    await assert(report.errors.length === 0, `Browser emitted errors: ${report.errors.join(" | ")}`);
  } finally {
    await browser.close();
  }
}

async function assert(condition, label) {
  if (!condition) {
    throw new Error(label);
  }
  activeReport?.checks.push(label);
  return condition;
}

async function stopDevServer(server) {
  if (hasChildExited(server.child)) return;
  if (!server.child.pid) {
    throw new Error("Vite process has no PID; cannot verify shutdown");
  }

  await stopProcessTree(server.child.pid);
  const didExit = await waitForChildExit(server.child, 5_000);
  if (!didExit) {
    throw new Error(`Vite process tree did not stop (PID ${server.child.pid})`);
  }
}

async function stopProcessTree(pid) {
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
      killer.once("exit", resolve);
      killer.once("error", resolve);
    });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
  await delay(500);
  try {
    process.kill(pid, "SIGKILL");
  } catch {
    // The process already stopped after SIGTERM.
  }
}

function waitForChildExit(child, timeoutMs) {
  if (hasChildExited(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      child.removeListener("exit", handleExit);
      resolve(hasChildExited(child));
    }, timeoutMs);
    function handleExit() {
      clearTimeout(timeout);
      resolve(true);
    }
    child.once("exit", handleExit);
  });
}

function hasChildExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
