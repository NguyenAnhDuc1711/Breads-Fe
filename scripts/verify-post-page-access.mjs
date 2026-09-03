
import { readFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const FIXTURES_FILE =
  process.env.FIXTURES_FILE || "./scripts/fixtures/post-access.sample.json";

const NOINDEX_RE = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i;

async function fetchPage(postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}`, { redirect: "manual" });
  const body = await res.text().catch(() => "");
  return { status: res.status, body };
}

async function checkDeleted(postId) {
  const { status } = await fetchPage(postId);
  const ok = status === 404 || status === 410;
  return { postId, ok, detail: `status=${status} (expected 404 or 410)` };
}

async function checkNoindex(postId) {
  const { status, body } = await fetchPage(postId);
  const hasNoindex = NOINDEX_RE.test(body);
  const ok = status === 200 && hasNoindex;
  return {
    postId,
    ok,
    detail: `status=${status} (expected 200), noindex meta ${hasNoindex ? "present" : "MISSING"}`,
  };
}

async function checkPublicHappyPath({ id, contentSnippet }) {
  const { status, body } = await fetchPage(id);
  const hasNoindex = NOINDEX_RE.test(body);
  const hasContent = contentSnippet ? body.includes(contentSnippet) : true;
  const ok = status === 200 && !hasNoindex && hasContent;
  return {
    postId: id,
    ok,
    detail: `status=${status} (expected 200), noindex ${hasNoindex ? "PRESENT (should be absent)" : "absent (ok)"}, content ${
      contentSnippet ? (hasContent ? "found" : "MISSING") : "not checked (no contentSnippet given)"
    }`,
  };
}

async function runCategory(name, ids, checkFn) {
  if (!ids || ids.length === 0) {
    console.warn(`[skip] category "${name}": 0 fixtures provided`);
    return [];
  }
  const results = [];
  for (const item of ids) {
    try {
      results.push({ category: name, ...(await checkFn(item)) });
    } catch (err) {
      results.push({
        category: name,
        postId: typeof item === "string" ? item : item.id,
        ok: false,
        detail: `threw: ${err.message}`,
      });
    }
  }
  return results;
}

async function main() {
  const raw = await readFile(FIXTURES_FILE, "utf-8");
  const fixtures = JSON.parse(raw);

  const allResults = [
    ...(await runCategory("deleted", fixtures.deleted, checkDeleted)),
    ...(await runCategory("private", fixtures.private, checkNoindex)),
    ...(await runCategory("preAcceptPublic", fixtures.preAcceptPublic, checkNoindex)),
    ...(await runCategory("publicHappyPath", fixtures.publicHappyPath, checkPublicHappyPath)),
  ];

  const byCategory = {};
  for (const r of allResults) {
    byCategory[r.category] ??= { pass: 0, fail: 0, failures: [] };
    if (r.ok) byCategory[r.category].pass++;
    else {
      byCategory[r.category].fail++;
      byCategory[r.category].failures.push(r);
    }
  }

  console.log("\n=== SC-2 verification summary ===");
  for (const [category, { pass, fail }] of Object.entries(byCategory)) {
    console.log(`${category}: ${pass} pass / ${fail} fail (total ${pass + fail})`);
  }

  const totalFail = allResults.filter((r) => !r.ok).length;
  if (totalFail > 0) {
    console.log("\n=== Failures ===");
    for (const r of allResults) {
      if (!r.ok) console.log(`[${r.category}] ${r.postId}: ${r.detail}`);
    }
  }

  console.log(`\nTotal: ${allResults.length} checked, ${totalFail} failed.`);
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error running verification script:", err);
  process.exit(1);
});
