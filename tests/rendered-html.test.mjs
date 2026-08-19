import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders all public and administrative pages", async () => {
  const expected = new Map([
    ["/", "Здравствуйте"],
    ["/prices", "Стоимость занятий"],
    ["/booking", "Выберите"],
    ["/privacy", "Политика обработки персональных данных"],
    ["/admin", "админ-панел"],
  ]);
  for (const [pathname, text] of expected) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    assert.match(await response.text(), new RegExp(text, "i"), pathname);
  }
});

test("booking page uses real database slots and privacy consent", async () => {
  const page = await readFile(new URL("../app/booking/page.tsx", import.meta.url), "utf8");
  assert.match(page, /fetch\("\/api\/schedule\.php"/);
  assert.match(page, /slot_id:\s*selectedSlot\.id/);
  assert.match(page, /href="\/privacy"/);
  assert.doesNotMatch(page, /const schedule\s*=\s*\[/);
});

test("backend atomically locks a slot before creating a booking", async () => {
  const [bootstrap, submit, adminAuth] = await Promise.all([
    readFile(new URL("../timeweb-backend/api/_bootstrap.php", import.meta.url), "utf8"),
    readFile(new URL("../timeweb-backend/api/submit.php", import.meta.url), "utf8"),
    readFile(new URL("../timeweb-backend/api/admin/_auth.php", import.meta.url), "utf8"),
  ]);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS tutor_slots/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS tutor_bookings/);
  assert.match(bootstrap, /UNIQUE KEY uq_slot_start/);
  assert.match(submit, /FOR UPDATE/);
  assert.match(submit, /UPDATE tutor_slots SET status = \\'pending\\'/);
  assert.ok(submit.indexOf("FOR UPDATE") < submit.indexOf("INSERT INTO tutor_bookings"));
  assert.match(adminAuth, /httponly/);
  assert.match(adminAuth, /samesite.*Strict/s);
  assert.match(adminAuth, /hash_equals\(admin_csrf_token\(\), \$token\)/);
});

test("static runtime includes live booking and admin controls", async () => {
  const runtime = await readFile(new URL("../scripts/github-pages-runtime.js", import.meta.url), "utf8");
  assert.match(runtime, /\/api\/schedule\.php/);
  assert.match(runtime, /\/api\/admin\/slots\.php/);
  assert.match(runtime, /\/api\/admin\/bookings\.php/);
  assert.match(runtime, /X-CSRF-Token/);
});
