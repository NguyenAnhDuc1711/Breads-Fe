/**
 * measure-scroll.js — công cụ đo cho epic list-virtualization (issue #7, #12)
 *
 * CÁCH DÙNG: dán toàn bộ file này vào DevTools Console của tab đang mở feed.
 *
 *   await MS.scrollToPostIndex(500)      // đưa trang về mốc 500 post
 *   MS.snapshot()                        // ảnh chụp DOM nodes / heap / post count
 *   await MS.measureScroll({ speed: 3000, duration: 5000 })
 *   await MS.measureLongTasks(10000)     // L(n) — cuộn 10s, đếm long task > 50ms
 *   await MS.measureCLS(30000)           // CLS(n) — cuộn 30s
 *   await MS.runBaseline()               // chạy trọn bộ 4 mốc, in bảng
 *
 * ─────────────────────────────────────────────────────────────────────────
 * GIỚI HẠN — ĐỌC TRƯỚC KHI TIN SỐ:
 *
 * 1. `performance.memory.usedJSHeapSize` KHÔNG phải `H_total` của PRD.
 *    Nó bị lượng tử hoá, chỉ có trên Chrome, và không tương đương tổng size
 *    của một heap snapshot. Script dùng nó làm PHÉP KIỂM CHÉO, không phải
 *    nguồn sự thật. `H_total` phải lấy từ Memory → Heap snapshot thủ công.
 *
 * 2. `H_data` (retained size của `state.post.listPost`) KHÔNG lấy được từ
 *    page JS — về nguyên tắc. Retained size chỉ tính được khi duyệt toàn bộ
 *    object graph, tức phải có heap snapshot. Đây là bước thủ công bắt buộc.
 *
 * 3. Script không kiểm được `postSelected === null` vì Redux store không
 *    expose ra global (tạo trong ref ở app/providers.tsx). Tự đóng PostPopup
 *    trước khi chụp, hoặc dùng Redux DevTools để xác nhận.
 * ─────────────────────────────────────────────────────────────────────────
 */

const MS = (() => {
  const POST_SELECTOR = ".post";

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const postCount = () => document.querySelectorAll(POST_SELECTOR).length;

  /**
   * Tab chạy nền => Chrome treo requestAnimationFrame và IntersectionObserver.
   * Hệ quả nếu bỏ qua: script cuộn đứng im, feed không bao giờ nạp thêm, và
   * mọi số đo ra đều là rác — nhưng KHÔNG có lỗi nào được ném ra. Đã dính bẫy
   * này một lần (2026-09-06): mất nhiều vòng chẩn đoán vì triệu chứng trông
   * hệt như một bug phân trang của app.
   *
   * Kiểm ngay từ đầu và ném lỗi to, thay vì để nó hỏng im lặng.
   */
  function assertForeground() {
    if (document.visibilityState !== "visible") {
      throw new Error(
        `[MS] Tab đang ẩn (visibilityState="${document.visibilityState}"). ` +
          `rAF và IntersectionObserver bị treo — mọi số đo sẽ vô nghĩa. ` +
          `Đưa tab này ra foreground rồi chạy lại.`,
      );
    }
    if (!document.hasFocus()) {
      console.warn(
        "[MS] Tab hiển thị nhưng không có focus. Số đo vẫn dùng được, " +
          "nhưng long task và CLS có thể lệch. Nên click vào trang trước khi đo.",
      );
    }
  }

  /** Cuộn ở tốc độ cố định (px/s) trong `duration` ms. Tái lập được, khác cuộn tay. */
  function measureScroll({ speed = 1500, duration = 10000 } = {}) {
    assertForeground();
    return new Promise((resolve) => {
      const startY = window.scrollY;
      const t0 = performance.now();
      let last = t0;
      let frames = 0;

      function step(now) {
        const dt = (now - last) / 1000;
        last = now;
        frames++;
        window.scrollBy(0, speed * dt);

        if (now - t0 >= duration) {
          const elapsed = (now - t0) / 1000;
          const travelled = window.scrollY - startY;
          resolve({
            travelled,
            elapsed,
            actualSpeed: Math.round(travelled / elapsed),
            targetSpeed: speed,
            // Lệch > 10% nghĩa là trang không cuộn kịp (đã chạm đáy, hoặc máy quá tải)
            deviation: +(Math.abs(travelled / elapsed - speed) / speed).toFixed(3),
            fps: Math.round(frames / elapsed),
          });
          return;
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const API_PROBE = "/api/v1/posts/?filter%5Bpage%5D=for_you&page=1&limit=1";

  /**
   * API giới hạn 200 request / 60s (`RateLimit-Policy: 200;w=60`).
   * Render nhiều post kéo theo nhiều request phụ (avatar, media), nên cuộn
   * nhanh sẽ vét sạch quota. Khi đó `getPosts` bị reject; reducer chỉ set
   * `isLoading = false` mà KHÔNG đụng `listPost`, nên effect `[data]` reset
   * `isFetchInFlight` không chạy và guard kẹt `true` tới hết timeout 15s.
   * Triệu chứng nhìn từ ngoài: feed đứng im, không lỗi, không request.
   *
   * Đọc quota còn lại từ header và tự chờ, thay vì đoán nhịp cuộn.
   */
  /**
   * ⚠️ CẠM BẪY ĐÃ DÍNH MỘT LẦN (2026-09-06): backend KHÔNG gửi
   * `Access-Control-Expose-Headers`, nên với request cross-origin
   * (`:3000` → `:8080`) mọi `headers.get("RateLimit-*")` trả về `null`.
   * `Number(null)` là `0` — nên nếu ép kiểu thẳng, hàm này sẽ báo
   * "quota còn 0" một cách thuyết phục trong khi quota đang là 199/200,
   * và mọi suy luận dựa trên nó đều sai.
   *
   * Vì vậy: phân biệt rõ "đọc được và bằng 0" với "không đọc được".
   * Chỉ curl từ terminal (same-origin, không qua CORS) mới thấy header thật.
   */
  async function rateLimitStatus(apiOrigin) {
    try {
      const res = await fetch(apiOrigin + API_PROBE, { method: "GET" });
      const rawRemaining = res.headers.get("RateLimit-Remaining");
      const rawReset = res.headers.get("RateLimit-Reset");
      if (rawRemaining === null) {
        return {
          remaining: null,
          resetSec: null,
          status: res.status,
          readable: false,
          note: "Header bị CORS che — KHÔNG suy luận gì từ giá trị này. Dùng: curl -D - <api>",
        };
      }
      return {
        remaining: Number(rawRemaining),
        resetSec: rawReset === null ? null : Number(rawReset),
        status: res.status,
        readable: true,
      };
    } catch {
      return { remaining: null, resetSec: null, status: null, readable: false };
    }
  }

  /**
   * Cuộn xuống cho tới khi đủ `n` post trong DOM.
   * Khi feed đứng, giả định trước tiên là hết quota — chờ cửa sổ reset rồi thử
   * lại, tối đa `maxBackoffs` lần. Chỉ kết luận "hết post" sau khi đã backoff hết.
   */
  async function scrollToPostIndex(
    n,
    { timeout = 900000, apiOrigin = "http://localhost:8080", maxBackoffs = 6, lowWater = 30 } = {},
  ) {
    assertForeground();
    const t0 = performance.now();
    let stagnant = 0;
    let backoffs = 0;
    let prev = postCount();

    while (postCount() < n) {
      // Chủ động phanh trước khi cạn quota, thay vì đợi bị chặn.
      // Bỏ qua khi header không đọc được (CORS) — không đoán bừa.
      const rl = await rateLimitStatus(apiOrigin);
      if (rl.readable && rl.remaining < lowWater) {
        const waitS = (rl.resetSec ?? 60) + 2;
        console.warn(`[MS] Quota còn ${rl.remaining} — chờ ${waitS}s cho cửa sổ reset…`);
        await sleep(waitS * 1000);
      }

      // Dùng cuộn dần thay vì window.scrollTo() nhảy thẳng xuống đáy.
      //
      // Lý do đề phòng: ở đáy trang, node observer (item thứ `length - preloadIndex`)
      // nằm PHÍA TRÊN vùng root+800px nên không giao. Cuộn dần thì đi xuyên qua
      // vùng kích hoạt trên đường xuống.
      //
      // ⚠️ CHƯA XÁC MINH đây có phải nguyên nhân thật hay không. Quan sát ngày
      // 2026-09-06 mâu thuẫn nhau: một lần chạy dùng ĐÚNG cách nhảy `scrollTo`
      // lại nạp trót lọt 20 → 480 post; những lần sau, cả nhảy lẫn cuộn chậm
      // 600px/s từ đỉnh xuống đáy đều không nạp thêm được post nào — trong khi
      // `hasMoreData: true`, `isLoading: false`, quota API 199/200. Biến số khác
      // biệt giữa hai trường hợp vẫn chưa tìm ra.
      // => Cuộn dần được chọn vì nó mô phỏng người dùng thật sát hơn, KHÔNG phải
      //    vì đã chứng minh được nó là cách duy nhất chạy đúng.
      await measureScroll({ speed: 2500, duration: 900 });
      await sleep(400);

      const cur = postCount();
      if (cur === prev) {
        stagnant++;
        if (stagnant >= 10) {
          if (backoffs < maxBackoffs) {
            backoffs++;
            const rl2 = await rateLimitStatus(apiOrigin);
            const waitS = (rl2.resetSec ?? 60) + 2;
            console.warn(
              `[MS] Đứng ở ${cur} post (backoff ${backoffs}/${maxBackoffs}). ` +
                `Quota còn ${rl2.remaining}. Chờ ${waitS}s…`,
            );
            await sleep(waitS * 1000);
            stagnant = 0;
            continue;
          }
          console.warn(`[MS] Dừng ở ${cur} post sau ${maxBackoffs} lần backoff — nhiều khả năng hết post thật.`);
          return { reached: cur, target: n, ok: false, why: "stagnant", backoffs };
        }
      } else {
        stagnant = 0;
        prev = cur;
      }

      if (performance.now() - t0 > timeout) {
        console.warn(`[MS] Timeout ở ${cur} post.`);
        return { reached: cur, target: n, ok: false, why: "timeout", backoffs };
      }
    }
    return { reached: postCount(), target: n, ok: true, backoffs };
  }

  /** Ảnh chụp tại một độ sâu. `heapMB` chỉ là kiểm chéo — xem GIỚI HẠN #1. */
  function snapshot() {
    const mem = performance.memory;
    return {
      posts: postCount(),
      domNodes: document.getElementsByTagName("*").length,
      heapMB: mem ? +(mem.usedJSHeapSize / 1048576).toFixed(1) : null,
      scrollHeight: document.body.scrollHeight,
      scrollY: Math.round(window.scrollY),
    };
  }

  /** L(n): số long task > 50ms trong lúc cuộn `duration` ms. */
  async function measureLongTasks(duration = 10000, speed = 1500) {
    const tasks = [];
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (e.duration > 50) tasks.push(Math.round(e.duration));
    });
    obs.observe({ type: "longtask", buffered: false });

    const scroll = await measureScroll({ speed, duration });
    await sleep(200);
    obs.disconnect();

    return {
      count: tasks.length,
      totalMs: tasks.reduce((a, b) => a + b, 0),
      maxMs: tasks.length ? Math.max(...tasks) : 0,
      scroll,
    };
  }

  /** CLS(n): layout shift tích luỹ trong lúc cuộn `duration` ms (bỏ shift do input). */
  async function measureCLS(duration = 30000, speed = 1500) {
    let cls = 0;
    let shifts = 0;
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) {
          cls += e.value;
          shifts++;
        }
      }
    });
    obs.observe({ type: "layout-shift", buffered: false });

    const scroll = await measureScroll({ speed, duration });
    await sleep(200);
    obs.disconnect();

    return { cls: +cls.toFixed(4), shifts, scroll };
  }

  const median = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };

  /**
   * Chạy trọn bộ baseline. In bảng để chép vào
   * .ccpm/context/epics/list-virtualization.md
   *
   * KHÔNG thay thế được heap snapshot thủ công — sau mỗi mốc, script sẽ dừng
   * và nhắc bạn chụp `H_total` và `H_data`.
   */
  async function runBaseline({ marks = [20, 100, 500, 1000], pauseForSnapshot = true } = {}) {
    const rows = [];
    for (const m of marks) {
      console.log(`\n[MS] === Mốc ${m} post ===`);
      const reach = await scrollToPostIndex(m);
      if (!reach.ok) {
        console.error(`[MS] Không đạt mốc ${m} (chỉ tới ${reach.reached}). Dừng.`);
        break;
      }
      await sleep(1000);
      const snap = snapshot();
      rows.push({ mark: m, ...snap });
      console.table([snap]);

      if (pauseForSnapshot) {
        console.log(
          `[MS] ⏸  Bây giờ chụp heap thủ công cho mốc ${m}:\n` +
            `     1. Đóng PostPopup nếu đang mở\n` +
            `     2. Memory → Force GC (biểu tượng thùng rác)\n` +
            `     3. Memory → Heap snapshot → ghi tổng size = H_total(${m})\n` +
            `     4. Tìm node "listPost" → cột Retained Size = H_data(${m})\n` +
            `     Xong thì gõ: MS.resume()`,
        );
        await new Promise((r) => (MS._resume = r));
      }

      if (m === 500) {
        console.log("[MS] Đo L(500) — cuộn 10s…");
        const lt = await measureLongTasks(10000);
        console.log("[MS] L(500) =", lt.count, lt);
        console.log("[MS] Đo CLS(500) — cuộn 30s…");
        const c = await measureCLS(30000);
        console.log("[MS] CLS(500) =", c.cls, c);
        rows[rows.length - 1].longTasks = lt.count;
        rows[rows.length - 1].cls = c.cls;
      }
    }
    console.log("\n[MS] === BẢNG KẾT QUẢ (chép vào epic context) ===");
    console.table(rows);
    return rows;
  }

  const api = {
    measureScroll,
    scrollToPostIndex,
    rateLimitStatus,
    snapshot,
    measureLongTasks,
    measureCLS,
    median,
    runBaseline,
    postCount,
    resume: () => api._resume && api._resume(),
    _resume: null,
  };
  return api;
})();

if (typeof window !== "undefined") window.MS = MS;
if (typeof module !== "undefined") module.exports = MS;
