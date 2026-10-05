import React, { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "../common/UIComponents";

// Sekmeleri (Tabs) asenkron olarak (Lazy Load) yüklüyoruz.
const OverviewTab = lazy(() => import("./tabs").then(m => ({ default: m.OverviewTab })));
const GeneralTab = lazy(() => import("./tabs").then(m => ({ default: m.GeneralTab })));
const ThemeTab = lazy(() => import("./tabs").then(m => ({ default: m.ThemeTab })));
const GalleryTab = lazy(() => import("./tabs").then(m => ({ default: m.GalleryTab })));
const GuestsAdminPanel = lazy(() => import("./tabs").then(m => ({ default: m.GuestsAdminPanel })));
const WishesAdminPanel = lazy(() => import("./tabs").then(m => ({ default: m.WishesAdminPanel })));
const PersonalLinkPanel = lazy(() => import("./tabs").then(m => ({ default: m.PersonalLinkPanel })));
const VisibilityTab = lazy(() => import("./tabs").then(m => ({ default: m.VisibilityTab })));
const SecurityTab = lazy(() => import("./tabs").then(m => ({ default: m.SecurityTab })));
const MessagesTab = lazy(() => import("./tabs").then(m => ({ default: m.MessagesTab })));
const CopyTab = lazy(() => import("./tabs").then(m => ({ default: m.CopyTab })));
const FamilyTab = lazy(() => import("./tabs").then(m => ({ default: m.FamilyTab })));
const CeremonyTab = lazy(() => import("./tabs").then(m => ({ default: m.CeremonyTab })));
const ScheduleTab = lazy(() => import("./tabs").then(m => ({ default: m.ScheduleTab })));
const QrTab = lazy(() => import("./tabs").then(m => ({ default: m.QrTab })));
const DataTab = lazy(() => import("./tabs").then(m => ({ default: m.DataTab })));
const GiftTab = lazy(() => import("./tabs").then(m => ({ default: m.GiftTab })));
const StoryTab = lazy(() => import("./tabs").then(m => ({ default: m.StoryTab })));
const TablePlanTab = lazy(() => import("./tabs").then(m => ({ default: m.TablePlanTab })));
const GuestPhotosTab = lazy(() => import("./tabs").then(m => ({ default: m.GuestPhotosTab })));
const PaymentsTab = lazy(() => import("./tabs").then(m => ({ default: m.PaymentsTab })));
const NotificationsTab = lazy(() => import("./tabs").then(m => ({ default: m.NotificationsTab })));

interface AdminPanelContentProps {
  activeAdminTab: string;
  [key: string]: any;
}

export function AdminPanelContent(props: AdminPanelContentProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;
  const { activeAdminTab } = props;

  const renderTab = () => {
    switch (activeAdminTab) {
      case "general": return <GeneralTab {...props} isEn={isEn} />;
      case "theme": return <ThemeTab {...props} isEn={isEn} />;
      case "gallery": return <GalleryTab {...props} isEn={isEn} />;
      case "guests": return <GuestsAdminPanel {...props} />;
      case "tablePlan": return <TablePlanTab {...props} isEn={isEn} />;
      case "wishes": return <WishesAdminPanel {...props} isEn={isEn} />;
      case "personalLink": return <PersonalLinkPanel {...props} />;
      case "visibility": return <VisibilityTab {...props} isEn={isEn} />;
      case "security": return <SecurityTab {...props} isEn={isEn} />;
      case "messages": return <MessagesTab {...props} isEn={isEn} />;
      case "copy": return <CopyTab {...props} isEn={isEn} />;
      case "family": return <FamilyTab {...props} isEn={isEn} />;
      case "ceremony": return <CeremonyTab {...props} isEn={isEn} />;
      case "schedule": return <ScheduleTab {...props} isEn={isEn} />;
      case "qr": return <QrTab {...props} isEn={isEn} />;
      case "data": return <DataTab {...props} isEn={isEn} />;
      case "gift": return <GiftTab {...props} isEn={isEn} />;
      case "story": return <StoryTab {...props} isEn={isEn} />; 
      case "guestPhotos": return <GuestPhotosTab {...props} isEn={isEn} />;
      case "payments": return <PaymentsTab {...props} isEn={isEn} />;
      case "notifications": return <NotificationsTab {...props} isEn={isEn} />;
      case "overview": return <OverviewTab {...props} isEn={isEn} setActiveAdminTab={props.setActiveAdminTab} />;
      default: return <OverviewTab {...props} isEn={isEn} setActiveAdminTab={props.setActiveAdminTab} />;
    }
  };

  return (
    <Suspense fallback={
      <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", color: "var(--rose-deep)" }}>
        <Spinner size={40} />
        <span style={{ fontWeight: 500, fontSize: "16px" }}>{isEn ? "Loading Module..." : "Modül Yükleniyor..."}</span>
      </div>
    }>
      {renderTab()}
    </Suspense>
  );
}