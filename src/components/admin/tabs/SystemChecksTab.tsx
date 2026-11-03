import React, { useCallback, useState } from "react";
import { AdminSection } from "../../AdminUI";
import {
  checkSupabaseReachability,
  clearSystemCheckHistory,
  downloadSystemCheckReport,
  getSystemChecks,
  loadSystemCheckHistory,
  saveSystemCheckRun,
  summarizeSystemChecks,
  SystemCheckResult,
  SystemCheckRun,
} from "./systemChecks";

export interface SystemChecksTabProps {
  isEn: boolean;
}

const statusColor = {
  pass: "#218739",
  warn: "#a66b00",
  fail: "#b42318",
};

export function SystemChecksTab({ isEn }: SystemChecksTabProps) {
  const [checks, setChecks] = useState<SystemCheckResult[]>([]);
  const [lastRun, setLastRun] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<SystemCheckRun[]>(() => loadSystemCheckHistory());

  const runChecks = useCallback(async () => {
    setRunning(true);
    const browserChecks = getSystemChecks();
    const supabaseCheck = await checkSupabaseReachability();
    const nextChecks = [...browserChecks, supabaseCheck];
    const run = { id: String(Date.now()), createdAt: new Date().toISOString(), checks: nextChecks };
    setChecks(nextChecks);
    setHistory(saveSystemCheckRun(run));
    setLastRun(new Date(run.createdAt).toLocaleString(isEn ? "en-US" : "tr-TR"));
    setRunning(false);
  }, [isEn]);

  const summary = summarizeSystemChecks(checks);

  return (
    <AdminSection title={isEn ? "System Checks" : "Sistem Kontrolleri"}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: "0 0 8px", color: "var(--text-main)" }}>
            {isEn ? "Run a safe browser health check" : "Güvenli tarayıcı sağlık kontrolü çalıştır"}
          </h3>
          <p className="admin-help-text" style={{ margin: 0 }}>
            {isEn
              ? "This checks browser capabilities only; it does not modify invitation data."
              : "Bu kontrol yalnızca tarayıcı yeteneklerini kontrol eder; davetiye verilerini değiştirmez."}
          </p>
        </div>
        <button type="button" className="main-button" onClick={runChecks} disabled={running}>
          {running
            ? isEn
              ? "Checking..."
              : "Kontrol ediliyor..."
            : isEn
              ? "Run Checks"
              : "Testleri Çalıştır"}
        </button>
      </div>

      {checks.length > 0 && (
        <>
          <div className="admin-edit-grid" style={{ marginTop: "24px" }}>
            {(["pass", "warn", "fail"] as const).map((status) => (
              <div key={status} className="card" style={{ padding: "16px", textAlign: "center" }}>
                <strong style={{ display: "block", fontSize: "28px", color: statusColor[status] }}>
                  {summary[status]}
                </strong>
                <span>
                  {isEn
                    ? status === "pass"
                      ? "Passed"
                      : status === "warn"
                        ? "Warnings"
                        : "Failed"
                    : status === "pass"
                      ? "Başarılı"
                      : status === "warn"
                        ? "Uyarı"
                        : "Hata"}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
            {checks.map((check) => (
              <div key={check.id} style={{ display: "flex", justifyContent: "space-between", gap: "16px", padding: "14px 16px", border: "1px solid var(--admin-border-color)", borderRadius: "12px" }}>
                <div>
                  <strong>{check.label}</strong>
                  <div className="admin-help-text">{check.detail}</div>
                </div>
                <strong style={{ color: statusColor[check.status], whiteSpace: "nowrap" }}>
                  {isEn
                    ? check.status === "pass"
                      ? "✓ Passed"
                      : check.status === "warn"
                        ? "⚠ Warning"
                        : "✕ Failed"
                    : check.status === "pass"
                      ? "✓ Başarılı"
                      : check.status === "warn"
                        ? "⚠ Uyarı"
                        : "✕ Hata"}
                </strong>
              </div>
            ))}
          </div>
          <p className="admin-help-text" style={{ marginTop: "16px" }}>
            {isEn ? "Last run: " : "Son çalışma: "}
            {lastRun}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" className="secondary-button" onClick={() => downloadSystemCheckReport({ id: String(Date.now()), createdAt: new Date().toISOString(), checks })}>
              {isEn ? "Download Report" : "Raporu İndir"}
            </button>
            <button type="button" className="secondary-button" onClick={() => { clearSystemCheckHistory(); setHistory([]); }}>
              {isEn ? "Clear History" : "Geçmişi Temizle"}
            </button>
          </div>
        </>
      )}
      {history.length > 0 && (
        <details style={{ marginTop: "24px" }}>
          <summary>{isEn ? `Previous runs (${history.length})` : `Önceki çalışmalar (${history.length})`}</summary>
          <ul>
            {history.map((run) => (
              <li key={run.id}>{new Date(run.createdAt).toLocaleString(isEn ? "en-US" : "tr-TR")} — {summarizeSystemChecks(run.checks).fail} hata</li>
            ))}
          </ul>
        </details>
      )}
    </AdminSection>
  );
}
