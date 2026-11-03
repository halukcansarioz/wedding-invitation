export type SystemCheckResult = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type SystemCheckRun = {
  id: string;
  createdAt: string;
  checks: SystemCheckResult[];
};

const HISTORY_KEY = "admin_system_check_history";

export function getSystemChecks(): SystemCheckResult[] {
  const checks: SystemCheckResult[] = [];

  checks.push({
    id: "online",
    label: "İnternet bağlantısı",
    status: typeof navigator !== "undefined" && navigator.onLine ? "pass" : "fail",
    detail:
      typeof navigator !== "undefined" && navigator.onLine
        ? "Tarayıcı çevrimiçi görünüyor."
        : "Tarayıcı çevrimdışı görünüyor.",
  });

  const storageAvailable = (() => {
    try {
      if (typeof localStorage === "undefined") return false;
      const key = "__wedding_invitation_health_check__";
      localStorage.setItem(key, "ok");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();
  checks.push({
    id: "storage",
    label: "Yerel depolama",
    status: storageAvailable ? "pass" : "fail",
    detail: storageAvailable
      ? "localStorage okunup yazılabiliyor."
      : "localStorage kullanılamıyor.",
  });

  const serviceWorkerSupported = "serviceWorker" in navigator;
  checks.push({
    id: "service-worker",
    label: "PWA desteği",
    status: serviceWorkerSupported ? "pass" : "warn",
    detail: serviceWorkerSupported
      ? "Tarayıcı service worker destekliyor."
      : "Tarayıcı service worker desteklemiyor.",
  });

  const viewportReady =
    typeof window !== "undefined" && window.innerWidth > 0 && window.innerHeight > 0;
  checks.push({
    id: "viewport",
    label: "Görüntü alanı",
    status: viewportReady ? "pass" : "warn",
    detail: viewportReady
      ? `${window.innerWidth} × ${window.innerHeight}px`
      : "Görüntü alanı ölçülemiyor.",
  });

  const unlabeledImages =
    typeof document === "undefined"
      ? 0
      : Array.from(document.images).filter((image) => !image.alt.trim()).length;
  checks.push({
    id: "accessibility-images",
    label: "Görsel erişilebilirliği",
    status: unlabeledImages === 0 ? "pass" : "warn",
    detail:
      unlabeledImages === 0
        ? "Tüm görseller alternatif metne sahip."
        : `${unlabeledImages} görselde alternatif metin eksik.`,
  });

  const unlabeledButtons =
    typeof document === "undefined"
      ? 0
      : Array.from(document.querySelectorAll("button")).filter(
          (button) => !button.textContent?.trim() && !button.getAttribute("aria-label")
        ).length;
  checks.push({
    id: "accessibility-buttons",
    label: "Buton erişilebilirliği",
    status: unlabeledButtons === 0 ? "pass" : "warn",
    detail:
      unlabeledButtons === 0
        ? "Tüm butonlar metin veya aria-label içeriyor."
        : `${unlabeledButtons} butonda erişilebilir etiket eksik.`,
  });

  const navigationTiming =
    typeof performance !== "undefined" ? performance.getEntriesByType("navigation")[0] : null;
  const loadTime =
    navigationTiming && "loadEventEnd" in navigationTiming
      ? Number(navigationTiming.loadEventEnd) - Number(navigationTiming.startTime)
      : 0;
  checks.push({
    id: "performance",
    label: "Sayfa performansı",
    status: loadTime === 0 || loadTime < 3000 ? "pass" : "warn",
    detail: loadTime > 0 ? `Sayfa yükleme süresi: ${Math.round(loadTime)} ms.` : "Yükleme metriği henüz hazır değil.",
  });

  const cacheSupported =
    typeof window !== "undefined" && "caches" in window;
  checks.push({
    id: "pwa-cache",
    label: "PWA cache desteği",
    status: cacheSupported ? "pass" : "warn",
    detail: cacheSupported ? "Cache Storage kullanılabilir." : "Cache Storage desteklenmiyor.",
  });

  return checks;
}

export async function checkSupabaseReachability(
  fetchImpl: typeof fetch = fetch,
  supabaseUrl = String(import.meta.env?.VITE_SUPABASE_URL || "").trim()
): Promise<SystemCheckResult> {
  if (!supabaseUrl) {
    return {
      id: "supabase",
      label: "Supabase bağlantısı",
      status: "warn",
      detail: "Supabase URL yapılandırılmamış; yerel kontrol yapıldı.",
    };
  }

  try {
    const response = await fetchImpl(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return {
      id: "supabase",
      label: "Supabase bağlantısı",
      status: response.ok || response.status === 401 ? "pass" : "warn",
      detail: `Supabase yanıtı: HTTP ${response.status}.`,
    };
  } catch {
    return {
      id: "supabase",
      label: "Supabase bağlantısı",
      status: "fail",
      detail: "Supabase endpoint'ine erişilemedi.",
    };
  }
}

export function loadSystemCheckHistory(): SystemCheckRun[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function saveSystemCheckRun(run: SystemCheckRun): SystemCheckRun[] {
  const history = [run, ...loadSystemCheckHistory()].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearSystemCheckHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function downloadSystemCheckReport(run: SystemCheckRun) {
  const blob = new Blob([JSON.stringify(run, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `system-check-${run.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function summarizeSystemChecks(checks: SystemCheckResult[]) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { pass: 0, warn: 0, fail: 0 }
  );
}
