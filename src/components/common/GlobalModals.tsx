import React, { memo } from "react";
import "../../styles/modals.css"; 

export interface ModalData {
  title: string;
  message?: string;
  label?: string;
  value?: string;
  multiline?: boolean;
  resolve: (value: any) => void;
}

interface GlobalModalsProps {
  customAlert: ModalData | null;
  setCustomAlert: (val: ModalData | null) => void;
  customConfirm: ModalData | null;
  setCustomConfirm: (val: ModalData | null) => void;
  customPrompt: ModalData | null;
  setCustomPrompt: (val: ModalData | null) => void;
  t: (key: string) => string;
}

export const GlobalModals = memo(function GlobalModals({ 
  customAlert, 
  setCustomAlert, 
  customConfirm, 
  setCustomConfirm, 
  customPrompt, 
  setCustomPrompt, 
  t 
}: GlobalModalsProps) {
  
  if (!customAlert && !customConfirm && !customPrompt) return null;

  return (
    <>
      {customAlert && (
        <div className="global-modal-overlay" onClick={() => { customAlert.resolve(true); setCustomAlert(null); }}>
          <div className="global-modal-container" onClick={e => e.stopPropagation()}>
            <h3 className="global-modal-title">{customAlert.title}</h3>
            <p className="global-modal-text">{customAlert.message}</p>
            <button type="button" className="main-button global-modal-btn" onClick={() => { customAlert.resolve(true); setCustomAlert(null); }}>
              {t('ui.ok')}
            </button>
          </div>
        </div>
      )}

      {customConfirm && (
        <div className="global-modal-overlay" onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }}>
          <div className="global-modal-container" onClick={e => e.stopPropagation()}>
            <h3 className="global-modal-title">{customConfirm.title}</h3>
            <p className="global-modal-text">{customConfirm.message}</p>
            <div className="global-modal-actions">
              <button type="button" className="main-button global-modal-btn" onClick={() => { customConfirm.resolve(true); setCustomConfirm(null); }}>
                {t('ui.yes')}
              </button>
              <button type="button" className="secondary-button global-modal-btn" onClick={() => { customConfirm.resolve(false); setCustomConfirm(null); }}>
                {t('ui.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {customPrompt && (
        <div className="global-modal-overlay" onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }}>
          <form className="global-modal-container prompt-modal" onSubmit={(e) => { e.preventDefault(); customPrompt.resolve(customPrompt.value); setCustomPrompt(null); }} onClick={e => e.stopPropagation()}>
            <h3 className="global-modal-title">{customPrompt.title}</h3>
            <p className="global-modal-text">{customPrompt.label}</p>
            {customPrompt.multiline ? (
              <textarea autoFocus value={customPrompt.value || ""} onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })} className="global-modal-input textarea" />
            ) : (
              <input autoFocus value={customPrompt.value || ""} onChange={e => setCustomPrompt({ ...customPrompt, value: e.target.value })} className="global-modal-input" />
            )}
            <div className="global-modal-actions">
              <button type="submit" className="main-button global-modal-btn">{t('ui.save')}</button>
              <button type="button" className="secondary-button global-modal-btn" onClick={() => { customPrompt.resolve(null); setCustomPrompt(null); }}>{t('ui.cancel')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
});