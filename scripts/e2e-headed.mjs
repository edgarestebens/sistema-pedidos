/**
 * E2E headed (Chrome visible) — Angular en puerto 4200.
 * npm run e2e:headed
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4200";
const PASS = "brasas123";
const results = [];

const log = (m) => console.log(`[e2e] ${m}`);

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    log(`OK  ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: String(e.message || e) });
    log(`FAIL ${name}: ${e.message || e}`);
  }
}

log("Abriendo Chrome — mirá esa ventana");

const browser = await chromium.launch({
  channel: "chrome",
  headless: false,
  slowMo: 700,
  args: ["--start-maximized"],
});
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
await page.bringToFront();
await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => page.goto(BASE));

await check("1. Landing", async () => {
  await page.getByRole("heading", { name: "Brasas del Sur" }).first().waitFor();
  await page.getByRole("link", { name: "Ver menú y pedir" }).waitFor();
});

await check("2. Menú", async () => {
  await page.getByRole("link", { name: "Ver menú y pedir" }).click();
  await page.getByText("Agregar al carrito").first().waitFor({ timeout: 30000 });
});

await check("3. Filtro Parrilla", async () => {
  await page.getByRole("button", { name: "Parrilla" }).click();
  await page.waitForTimeout(500);
  if ((await page.locator("article").count()) < 1) throw new Error("sin platos");
  await page.getByRole("button", { name: "Todos" }).click();
});

await check("4. Agregar al carrito", async () => {
  await page.getByRole("button", { name: "Agregar al carrito" }).first().click();
  await page.waitForTimeout(700);
});

await check("5. Carrito", async () => {
  await page.getByRole("link", { name: /Carrito/ }).click();
  await page.getByRole("link", { name: "Ir a pagar" }).waitFor();
});

await check("6. Login cliente", async () => {
  await page.goto(`${BASE}/login`);
  await page.locator('input[type="email"]').fill("cliente@brasas.com");
  await page.locator('input[type="password"]').fill(PASS);
  await page.getByRole("button", { name: /Entrar/ }).click();
  await page.waitForURL("**/menu", { timeout: 60000 });
});

await check("7. Checkout efectivo", async () => {
  await page.goto(`${BASE}/checkout`);
  await page.getByRole("heading", { name: "Checkout" }).waitFor({ timeout: 25000 });
  await page.locator('input[name="phone"]').fill("1155558888");
  await page.locator('input[name="address"]').fill("Retiro en local");
  await page.getByRole("button", { name: "Efectivo" }).click();
  await page.getByRole("button", { name: /Pagar/ }).click();
  await page.waitForFunction(
    () =>
      document.body.innerText.includes("Pedido confirmado") ||
      document.body.innerText.includes("brasas ya trabajan") ||
      location.pathname.includes("mis-pedidos"),
    null,
    { timeout: 45000 }
  );
});

await check("8. Mis pedidos", async () => {
  await page.goto(`${BASE}/mis-pedidos`);
  await page.getByText(/ORD-/).first().waitFor({ timeout: 25000 });
});

await check("9. Login admin", async () => {
  await page.goto(`${BASE}/dashboard/login`);
  await page.locator('input[type="email"]').fill("admin@brasas.com");
  await page.locator('input[type="password"]').fill(PASS);
  await page.getByRole("button", { name: /Entrar al panel/ }).click();
  await page.waitForURL("**/dashboard/pedidos", { timeout: 60000 });
  await page.getByText("Pedidos en cocina").waitFor();
});

await check("10. Nota en Kanban", async () => {
  const note = `Nota Angular ${Date.now()}`;
  await page
    .getByRole("button", { name: /Añadir nota|Editar nota|Anadir nota/i })
    .first()
    .waitFor({ timeout: 20000 });
  await page
    .getByRole("button", { name: /Añadir nota|Editar nota|Anadir nota/i })
    .first()
    .click();
  await page.getByPlaceholder(/Nota para cocina/i).fill(note);
  await page.getByRole("button", { name: "Guardar" }).click();
  await page.getByText(note).first().waitFor({ timeout: 15000 });
  await page
    .getByRole("button", { name: /Editar nota/i })
    .first()
    .waitFor();
  await page.waitForTimeout(1500);
});

await check("11. Kanban avanzar", async () => {
  const btn = page.getByRole("button", { name: "Avanzar →" }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(1500);
  }
});

await check("12. Nuevo plato", async () => {
  await page.goto(`${BASE}/dashboard/menu`);
  await page.getByRole("button", { name: "Nuevo plato" }).click();
  const name = `Test Angular ${Date.now()}`;
  await page.locator("form input").nth(0).fill(name);
  await page.locator("form textarea").fill("Prueba Angular");
  await page.locator('form input[type="number"]').fill("7770");
  await page.getByRole("button", { name: "Crear plato" }).click();
  await page.getByText(name).first().waitFor({ timeout: 15000 });
});

await check("13. Ajustes", async () => {
  await page.goto(`${BASE}/dashboard/ajustes`);
  await page.getByText("Ajustes del negocio").waitFor();
  await page.getByRole("button", { name: "Guardar cambios" }).waitFor();
});

log("—— Resumen ——");
for (const r of results) log(`${r.ok ? "OK" : "FAIL"} ${r.name}${r.error ? " | " + r.error : ""}`);
const failed = results.filter((r) => !r.ok).length;
log(`${results.length - failed}/${results.length} pasaron`);
log("Ventana abierta 20s más…");
await page.waitForTimeout(20000);
await browser.close();
process.exit(failed ? 1 : 0);
