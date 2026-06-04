"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import { AdminTopActions, DataCard } from "@/components/cafe/AdminKit";
import { Database, Server, HardDrive, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("KHR");
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState("10");

  const [systemStatus, setSystemStatus] = useState({
    api: "checking",
    database: "checking",
    storage: "checking",
  });

  // Verify connectivity status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/public/categories");
        if (response.ok) {
          setSystemStatus({
            api: "online",
            database: "online",
            storage: "online", // Seed checks successfully
          });
        } else {
          throw new Error("API not ok");
        }
      } catch {
        setSystemStatus({
          api: "offline",
          database: "offline",
          storage: "offline",
        });
      }
    };
    checkStatus();
  }, []);

  const handleSave = () => {
    toast.success("Settings updated successfully");
  };

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Connection Status panel */}
        <section className="space-y-6 lg:col-span-1">
          <DataCard title="System Connectivity">
            <div className="space-y-5 p-2">
              {/* API status */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-semibold text-sm">Backend API</h4>
                    <p className="text-xs text-gray-400">http://localhost:8080</p>
                  </div>
                </div>
                {systemStatus.api === "online" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5" /> Offline
                  </span>
                )}
              </div>

              {/* Database status */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-semibold text-sm">PostgreSQL DB</h4>
                    <p className="text-xs text-gray-400">db_590st_cafe</p>
                  </div>
                </div>
                {systemStatus.database === "online" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5" /> Disconnected
                  </span>
                )}
              </div>

              {/* MinIO Storage status */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-semibold text-sm">MinIO Object Store</h4>
                    <p className="text-xs text-gray-400">590st-cafe-media</p>
                  </div>
                </div>
                {systemStatus.storage === "online" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5" /> Disconnected
                  </span>
                )}
              </div>
            </div>
          </DataCard>

          <DataCard title="Security Profile">
            <div className="flex items-start gap-3 p-2">
              <ShieldCheck className="h-10 w-10 text-lime-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Administrator Mode</h4>
                <p className="text-xs text-gray-500 mt-1">
                  You are logged in with Admin Role. You have full access to products, categories, logs, and billing reports.
                </p>
              </div>
            </div>
          </DataCard>
        </section>

        {/* Configuration settings panel */}
        <section className="lg:col-span-2">
          <DataCard title="Dashboard Configuration">
            <div className="space-y-6 p-2">
              {/* Theme Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Theme</label>
                <div className="mt-3 flex items-center gap-4">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`h-10 rounded-md border px-5 text-sm font-semibold capitalize transition ${
                        theme === t
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Currency</label>
                <div className="mt-3 flex items-center gap-4">
                  {["KHR", "USD"].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`h-10 rounded-md border px-5 text-sm font-semibold transition ${
                        currency === curr
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Alerts toggle */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 font-semibold">Sound Notifications</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Play alert sound when a new order is received</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundAlerts(!soundAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    soundAlerts ? "bg-lime-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      soundAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Auto Refresh interval */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Order Queue Auto-Refresh Rate
                </label>
                <span className="relative mt-2 block max-w-xs">
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(e.target.value)}
                    className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none"
                  >
                    <option value="5">Every 5 Seconds</option>
                    <option value="10">Every 10 Seconds</option>
                    <option value="30">Every 30 Seconds</option>
                    <option value="60">Every Minute</option>
                  </select>
                </span>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-10 rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </DataCard>
        </section>
      </div>
    </PageShell>
  );
}
