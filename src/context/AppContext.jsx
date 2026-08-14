// src/context/AppContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { loadStoredSiteData } from '../utils/helpers';
import { INITIAL_GUEST_FORM, INITIAL_WISH_FORM } from '../config/constants';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [guestForm, setGuestForm] = useState(INITIAL_GUEST_FORM);
  const [wishForm, setWishForm] = useState(INITIAL_WISH_FORM);
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState("general");
  const [personalLinkName, setPersonalLinkName] = useState("");
  const [dataImportText, setDataImportText] = useState("");
  const [customAlert, setCustomAlert] = useState(null);
  const [customConfirm, setCustomConfirm] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(null);

  const value = {
    siteData, setSiteData,
    adminDraft, setAdminDraft,
    opened, setOpened,
    isOpening, setIsOpening,
    guestForm, setGuestForm,
    wishForm, setWishForm,
    guests, setGuests,
    wishes, setWishes,
    activeAdminTab, setActiveAdminTab,
    personalLinkName, setPersonalLinkName,
    dataImportText, setDataImportText,
    customAlert, setCustomAlert,
    customConfirm, setCustomConfirm,
    customPrompt, setCustomPrompt
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);