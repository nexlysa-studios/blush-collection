import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SettingsContext = React.createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    delivery_fee: 50,
    min_order: 100,
    whatsapp_number: "27614045481",
    instagram_handle: "julesforher_",
    tiktok_handle: "julesforher_",
    announcement: "Cape Town deliveries available  •  Minimum order R100",
    about_headline: "Made For Her, Chosen By Her.",
    about_text: "",
  });

  useEffect(() => {
    api.get("/settings").then((r) => setSettings((s) => ({ ...s, ...r.data }))).catch(() => {});
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => React.useContext(SettingsContext);
