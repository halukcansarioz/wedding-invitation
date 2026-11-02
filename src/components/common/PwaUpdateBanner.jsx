import { useEffect, useState } from "react";

export function PwaUpdateBanner() {
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    const handleUpdate = (event) => setUpdate(() => event.detail);
    window.addEventListener("pwa-update-available", handleUpdate);
    return () => window.removeEventListener("pwa-update-available", handleUpdate);
  }, []);

  if (!update) return null;

  return (
    <div className="pwa-update-banner" role="status">
      <span>Yeni sürüm hazır.</span>
      <button type="button" onClick={() => update(true)}>
        Yenile
      </button>
    </div>
  );
}
