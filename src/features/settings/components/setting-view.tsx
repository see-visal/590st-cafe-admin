"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { AdminTopActions, DataCard } from "@/components/shared/admin-kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PREFERENCE_DEFAULTS,
  readPreferences,
  writePreferences,
  type Preferences,
} from "@/hooks/use-preferences";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiState = "checking" | "reachable" | "unreachable" | "unconfigured";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Preferences>(PREFERENCE_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [apiState, setApiState] = useState<ApiState>("checking");
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(readPreferences());
    setLoaded(true);
  }, []);

  /**
   * Reachability only. The browser cannot see the database or object store, so
   * this reports the one thing it can actually verify: whether the API answers.
   * Any HTTP response counts — a 401 still proves the server is up.
   */
  const checkApi = useCallback(async () => {
    if (!API_BASE) {
      setApiState("unconfigured");
      return;
    }
    setApiState("checking");
    try {
      await fetch(API_BASE, { method: "HEAD", mode: "no-cors" });
      setApiState("reachable");
    } catch {
      setApiState("unreachable");
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    void checkApi();
  }, [checkApi]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      writePreferences(prefs);
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings on this device");
    }
  };

  const handleReset = () => {
    setPrefs(PREFERENCE_DEFAULTS);
    setTheme("light");
    writePreferences(PREFERENCE_DEFAULTS);
    toast.success("Settings reset to defaults");
  };

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Settings" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="min-w-0">
          <DataCard
            title="Dashboard Configuration"
            meta="Preferences are stored on this device"
          >
            <div className="divide-y divide-[#EDEDED]">
              <SettingRow
                label="Display theme"
                description="Applies across the whole dashboard"
              >
                <Segmented
                  options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" },
                  ]}
                  value={theme ?? "light"}
                  onChange={setTheme}
                />
              </SettingRow>

              <SettingRow
                label="Preferred currency"
                description="Used when formatting prices and totals"
              >
                <Segmented
                  options={[
                    { value: "KHR", label: "KHR ៛" },
                    { value: "USD", label: "USD $" },
                  ]}
                  value={prefs.currency}
                  onChange={(v) => update("currency", v as Preferences["currency"])}
                />
              </SettingRow>

              <SettingRow
                label="Sound notifications"
                description="Play an alert when a new order arrives"
              >
                <Toggle
                  checked={prefs.soundAlerts}
                  onChange={(next) => update("soundAlerts", next)}
                  label="Sound notifications"
                />
              </SettingRow>

              <SettingRow
                label="Order queue refresh"
                description="How often the barista queue re-fetches"
              >
                <Select
                  value={prefs.autoRefreshInterval}
                  onValueChange={(v) => update("autoRefreshInterval", v)}
                >
                  <SelectTrigger className="h-9 w-42 rounded-lg border-[#CED1D8] bg-white text-sm text-[#35373D]">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="border-[#CED1D8] bg-white text-[#35373D]">
                    <SelectItem value="5">Every 5 seconds</SelectItem>
                    <SelectItem value="10">Every 10 seconds</SelectItem>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every minute</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#EDEDED] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="btn_outline_black"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!loaded}
                className="btn_primary_black"
              >
                Save changes
              </button>
            </div>
          </DataCard>
        </section>

        <section className="flex min-w-0 flex-col gap-5">
          <DataCard title="API Connection">
            <div className="rounded-lg border border-[#EDEDED] bg-[#FAFAFA] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#333333] ring-1 ring-[#EDEDED]">
                    <Server className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E1E1E]">
                      Backend API
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {API_BASE || "NEXT_PUBLIC_API_URL is not set"}
                    </p>
                  </div>
                </div>
                <ApiBadge state={apiState} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EDEDED] pt-3">
                <span className="text-xs text-gray-500">
                  {lastChecked ? `Checked at ${lastChecked}` : "Not checked yet"}
                </span>
                <button
                  type="button"
                  onClick={() => void checkApi()}
                  disabled={apiState === "checking"}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#333333] transition-colors hover:bg-white disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("size-3.5", apiState === "checking" && "animate-spin")}
                  />
                  Recheck
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Only API reachability can be verified from the browser. Database
              and object-store health are reported by the API itself.
            </p>
          </DataCard>

          <DataCard title="Security Profile">
            <div className="flex items-start gap-3 rounded-lg border border-[#EDEDED] bg-[#FAFAFA] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-black text-[#befe35]">
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1E1E1E]">
                  Administrator mode
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Full access to products, categories, inventory, audit logs and
                  billing reports.
                </p>
              </div>
            </div>
          </DataCard>
        </section>
      </div>
    </PageShell>
  );
}

/* -------------------------------------------------------------- primitives */

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1E1E1E]">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      role="group"
      className="inline-flex rounded-lg border border-[#CED1D8] bg-[#F4F4F4] p-0.5"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "h-8 cursor-pointer rounded-md px-3.5 text-xs font-semibold transition-colors",
              isActive
                ? "bg-black text-white"
                : "text-[#6b7280] hover:text-[#111111]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#befe35]",
        checked ? "bg-black" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "pointer-events-none size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function ApiBadge({ state }: { state: ApiState }) {
  const config = {
    checking: {
      icon: <Loader2 className="size-3.5 animate-spin" />,
      label: "Checking",
      tone: "bg-gray-100 text-gray-600",
    },
    reachable: {
      icon: <CheckCircle2 className="size-3.5" />,
      label: "Reachable",
      tone: "bg-green-100 text-green-700",
    },
    unreachable: {
      icon: <AlertTriangle className="size-3.5" />,
      label: "Unreachable",
      tone: "bg-red-100 text-red-600",
    },
    unconfigured: {
      icon: <AlertTriangle className="size-3.5" />,
      label: "Not configured",
      tone: "bg-amber-100 text-amber-700",
    },
  }[state];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        config.tone
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
