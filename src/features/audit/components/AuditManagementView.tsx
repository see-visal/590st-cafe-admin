"use client";

import { useState } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminTopActions, Cell, DataCard, PaginationFooter, Row, SimpleTable, TableState } from "@/components/common/AdminKit";
import { useGetOrderHistoryQuery, useListOrdersQuery } from "@/store/api/orderApi";
import { useGetAttendanceHistoryQuery, useListAttendanceQuery } from "@/store/api/attendanceApi";
import { useRefreshOptions } from "@/contexts/AdminPreferencesContext";

const readable = (value: string) => value.toLowerCase().replaceAll("_", " ");

export default function AuditManagementView() {
  const polling = useRefreshOptions();
  const [source, setSource] = useState<"orders" | "attendance">("orders");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const orders = useListOrdersQuery({ page, size: 10 }, { ...polling, skip: source !== "orders" });
  const attendance = useListAttendanceQuery({ page, size: 10 }, { ...polling, skip: source !== "attendance" });
  const orderHistory = useGetOrderHistoryQuery(selectedId, { skip: source !== "orders" || !selectedId });
  const attendanceHistory = useGetAttendanceHistoryQuery(selectedId, { skip: source !== "attendance" || !selectedId });
  const records = source === "orders" ? orders : attendance;
  const history = source === "orders" ? orderHistory : attendanceHistory;
  const rows = source === "orders"
    ? orders.data?.content.map((order) => ({ id: order.id, name: order.customerName ?? "Walk-in", date: order.createdAt, status: order.status }))
    : attendance.data?.content.map((entry) => ({ id: entry.id, name: entry.baristaName, date: entry.checkInAt, status: entry.open ? "OPEN" : "CLOSED" }));

  return <PageShell>
    <PageHeader title="Audit Trail" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Audit Trail" }]} rightSlot={<AdminTopActions />} />
    <p className="text-sm text-muted-foreground">Select an order or attendance record to view its recorded actions and the people who performed them.</p>
    <label className="text-sm">History source
      <select aria-label="History source" className="ml-3 rounded border p-2" value={source} onChange={(event) => {
        setSource(event.target.value as "orders" | "attendance"); setPage(1); setSelectedId("");
      }}><option value="orders">Orders</option><option value="attendance">Attendance</option></select>
    </label>
    <DataCard title={source === "orders" ? "Orders" : "Attendance"} meta={records.data ? `${records.data.totalElements} records` : undefined}>
      <SimpleTable headers={["Record", "Name", "Date", "Status", "History"]}>
        <TableState colSpan={5} isLoading={records.isFetching} error={records.error} isEmpty={!rows?.length} onRetry={records.refetch} />
        {!records.isFetching && !records.error && rows?.map((row) => <Row key={row.id}>
          <Cell><span className="font-mono">{row.id.slice(0, 8).toUpperCase()}</span></Cell>
          <Cell>{row.name}</Cell><Cell>{row.date.replace("T", " ")}</Cell><Cell>{readable(row.status)}</Cell>
          <Cell><button type="button" className="underline" onClick={() => setSelectedId(row.id)}>{selectedId === row.id ? "Selected" : "View history"}</button></Cell>
        </Row>)}
      </SimpleTable>
      <PaginationFooter page={page} size={10} totalElements={records.data?.totalElements} totalPages={records.data?.totalPages ?? 0}
        onPageChange={(next) => { setPage(next); setSelectedId(""); }} />
    </DataCard>
    {selectedId && <DataCard title={`History: ${selectedId.slice(0, 8).toUpperCase()}`}>
      <SimpleTable headers={["Date", "Action", "Actor", "Role", "Note"]}>
        <TableState colSpan={5} isLoading={history.isFetching} error={history.error} isEmpty={!history.currentData?.length} onRetry={history.refetch} />
        {!history.isFetching && !history.error && history.currentData?.map((entry) => <Row key={entry.id}>
          <Cell>{entry.createdAt.replace("T", " ")}</Cell><Cell>{readable(entry.action)}</Cell>
          <Cell>{entry.actorName ?? "Unknown actor"}</Cell><Cell>{entry.actorRole ? readable(entry.actorRole) : "—"}</Cell>
          <Cell>{"note" in entry ? entry.note : "—"}</Cell>
        </Row>)}
      </SimpleTable>
    </DataCard>}
  </PageShell>;
}