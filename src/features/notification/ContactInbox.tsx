"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { useListContactMessagesQuery, useUpdateContactStatusMutation, type ContactMessage } from "@/store/api/contactApi";
import { useCurrentRole } from "@/store/api/useCurrentRole";
import { apiErrorMessage } from "@/store/api/baseApi";
import { humanise, titleCase } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeedbackAlerts } from "@/hooks/useFeedbackAlerts";
import { formatPhone } from "@/lib/phone";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useI18n } from "@/contexts/I18nContext";

export function ContactInbox() {
  const { t } = useI18n();
  const { isAdmin } = useCurrentRole();
  const [page, setPage] = usePersistentState("contact-inbox:page", 1);
  const [status, setStatus] = usePersistentState<ContactMessage["status"]>("contact-inbox:status", "NEW");
  const { data, isLoading, error, refetch } = useListContactMessagesQuery({ page, size: 10, status }, {
    skip: !isAdmin, pollingInterval: 15000, refetchOnMountOrArgChange: true,
  });

  useFeedbackAlerts(useCallback(() => { if (isAdmin) void refetch(); }, [isAdmin, refetch]));
  const [updateStatus, { isLoading: isUpdating }] = useUpdateContactStatusMutation();
  if (!isAdmin) return null;
  const resolve = async (message: ContactMessage) => {
    try {
      await updateStatus({ id: message.id, status: message.status === "NEW" ? "RESOLVED" : "NEW" }).unwrap();
      toast.success(t("notifications.contact.toast.updated", "Message updated"));
    } catch (error) { toast.error(apiErrorMessage(error as never, t("notifications.contact.errors.update", "Could not update the message."))); }
  };
  return <section className="space-y-4 rounded-xl border bg-white p-5" aria-label={t("notifications.contact.label", "Customer messages")}>
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{t("notifications.contact.heading", "Customer messages ({count})", { count: data?.totalElements ?? 0 })}</h2>
      <Select value={status} onValueChange={(next) => { setStatus(next as ContactMessage["status"]); setPage(1); }}>
        <SelectTrigger aria-label={t("notifications.contact.status_label", "Message status")} className="form_field_select_trigger is_compact">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="form_field_select_content">
          <SelectItem value="NEW" className="form_field_select_item">Needs attention</SelectItem>
          <SelectItem value="RESOLVED" className="form_field_select_item">Resolved</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {isLoading && <p role="status">{t("notifications.contact.loading", "Loading messages...")}</p>}
    {error && <div role="alert" className="text-sm text-red-600">
      <p>{apiErrorMessage(error as never, t("notifications.contact.errors.load", "Could not load messages."))}</p>
      <button type="button" className="underline" onClick={() => { void refetch(); }}>{t("actions.retry", "Retry")}</button>
    </div>}
    {!isLoading && !error && data?.content.length === 0 && <p className="text-sm text-gray-500">{t("notifications.contact.empty", "No messages in this view.")}</p>}
    {data?.content.map((message) => <article key={message.id} className="space-y-2 rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{humanise(message.topic)} · {titleCase(message.fullName)}</h3>
        <span className="text-xs text-gray-500">{message.createdAt.replace("T", " ")}</span></div>
      <p>{message.email}{message.phoneNumber ? ` · ${formatPhone(message.phoneNumber)}` : ""}</p>
      <p className="whitespace-pre-wrap break-words">{message.message}</p>
      <div className="flex gap-4 pt-2">
        <a href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${humanise(message.topic)}`)}`} className="underline">{t("notifications.contact.reply_by_email", "Reply by email")}</a>
        <button type="button" disabled={isUpdating} onClick={() => { void resolve(message); }} className="underline disabled:opacity-50">
          {message.status === "NEW" ? t("notifications.contact.mark_resolved", "Mark resolved") : t("notifications.contact.reopen", "Reopen")}
        </button>
      </div>
    </article>)}
    <div className="flex items-center justify-between text-sm">
      <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">{t("actions.previous", "Previous")}</button>
      <span>{t("notifications.contact.page_of", "Page {page} of {total}", { page, total: Math.max(1, data?.totalPages ?? 1) })}</span>
      <button type="button" disabled={!data || page >= data.totalPages} onClick={() => setPage(page + 1)} className="disabled:opacity-40">{t("actions.next", "Next")}</button>
    </div>
  </section>;
}
