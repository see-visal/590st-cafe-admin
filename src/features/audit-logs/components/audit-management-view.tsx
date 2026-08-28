"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DateField,
  FilterActions,
  FilterPanel,
  PaginationFooter,
  Row,
  SelectField,
  SelectItem,
  SimpleTable,
  TableActions,
  TextField,
} from "@/components/shared/admin-kit";
import {
  AuditActionBadge,
  AuditRoleBadge,
} from "@/features/audit-logs/components/audit-badges";
import { AUDIT_TOTAL_COUNT, STATIC_AUDIT_ROWS } from "@/features/audit-logs/constants/audit.mock";
import { usePagination } from "@/hooks/use-pagination";
import { downloadCsv } from "@/lib/export-csv";
import type {
  AuditAction,
  AuditLogRow,
  AuditRole,
} from "@/features/audit-logs/types/audit.type";

const AUDIT_TABLE_HEADERS = [
  "ID",
  "Timestamp",
  "Actor",
  "Role",
  "Entity",
  "Action",
  "Description",
  "IP Address",
] as const;

export default function AuditManagementView() {
  const [auditId, setAuditId] = useState("");
  const [actor, setActor] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredRows = useMemo(() => {
    return STATIC_AUDIT_ROWS.filter((row) => {
      const matchesAuditId =
        !auditId ||
        row.auditId.toLowerCase().includes(auditId.toLowerCase()) ||
        row.description.toLowerCase().includes(auditId.toLowerCase());

      const matchesActor =
        !actor || row.actor.toLowerCase().includes(actor.toLowerCase());

      const matchesRole =
        !roleFilter || row.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesEntity =
        !entityFilter || row.entity.toLowerCase() === entityFilter.toLowerCase();

      const matchesAction =
        !actionFilter || row.action.toLowerCase() === actionFilter.toLowerCase();

      return (
        matchesAuditId &&
        matchesActor &&
        matchesRole &&
        matchesEntity &&
        matchesAction
      );
    });
  }, [actionFilter, actor, auditId, entityFilter, roleFilter]);

  const pagination = usePagination(filteredRows);

  const handleClear = () => {
    setAuditId("");
    setActor("");
    setRoleFilter("");
    setEntityFilter("");
    setActionFilter("");
    setDateRange(undefined);
  };

  const handleExport = () =>
    downloadCsv("audit-log", filteredRows, [
      { header: "Audit ID", value: (r) => r.auditId },
      { header: "Timestamp", value: (r) => r.timestamp },
      { header: "Actor", value: (r) => r.actor },
      { header: "Role", value: (r) => r.role },
      { header: "Entity", value: (r) => r.entity },
      { header: "Action", value: (r) => r.action },
      { header: "Description", value: (r) => r.description },
      { header: "IP Address", value: (r) => r.ipAddress },
    ]);

  const isWarningAction = (row: AuditLogRow) =>
    row.action === "Updated" &&
    (row.entity === "Inventory" || row.entity === "Staff");

  return (
    <PageShell>
      <PageHeader
        title="Audit Trail"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Analytics & Admin" },
          { label: "Audit Trail" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <FilterPanel defaultCollapsed={false}>
        <TextField
          label="Audit ID / Keyword"
          placeholder="e.g. AUD-0248"
          value={auditId}
          onChange={(event) => setAuditId(event.target.value)}
        />
        <TextField
          label="Actor"
          placeholder="Search by actor name"
          value={actor}
          onChange={(event) => setActor(event.target.value)}
        />
        <SelectField
          label="Role"
          placeholder="All Roles"
          value={roleFilter}
          onValueChange={(event) => setRoleFilter(event)}
        >
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="barista">Barista</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
        </SelectField>
        <SelectField
          label="Entity"
          placeholder="All Entities"
          value={entityFilter}
          onValueChange={(event) => setEntityFilter(event)}
        >
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="order">Order</SelectItem>
          <SelectItem value="promotion">Promotion</SelectItem>
          <SelectItem value="inventory">Inventory</SelectItem>
          <SelectItem value="settings">Settings</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectField>
        <SelectField
          label="Action"
          placeholder="All Actions"
          value={actionFilter}
          onValueChange={(event) => setActionFilter(event)}
        >
          <SelectItem value="updated">Updated</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="adjusted">Adjusted</SelectItem>
          <SelectItem value="login">Login</SelectItem>
        </SelectField>
        <DateField label="Date Range" value={dateRange} onChange={setDateRange} />
        <FilterActions onClear={handleClear} />
      </FilterPanel>

      <div className="[&_.chart_card_wrapper]:rounded-2xl">
        <DataCard
          title="Audit Log"
          meta={`Showing ${pagination.from}-${pagination.to} of ${pagination.total} (total ${AUDIT_TOTAL_COUNT})`}
          actions={<TableActions showRegister={false} onExport={handleExport} />}
        >
        <div className="[&_.data_table]:min-w-[1280px] [&_.data_table]:overflow-hidden [&_.data_table]:rounded-2xl">
          <SimpleTable headers={[...AUDIT_TABLE_HEADERS]}>
            {pagination.pageRows.map((row, index) => (
              <Row key={row.id} striped={index % 2 === 1}>
                <Cell className="font-semibold text-[#1E1E1E]">{row.auditId}</Cell>
                <Cell>{row.timestamp}</Cell>
                <Cell className="font-semibold text-[#1E1E1E]">{row.actor}</Cell>
                <Cell>
                  <AuditRoleBadge role={row.role as AuditRole} />
                </Cell>
                <Cell>{row.entity}</Cell>
                <Cell>
                  <AuditActionBadge
                    action={row.action as AuditAction}
                    warning={isWarningAction(row)}
                  />
                </Cell>
                <Cell className="max-w-[360px] leading-[1.4] whitespace-normal">{row.description}</Cell>
                <Cell>{row.ipAddress}</Cell>
              </Row>
            ))}
          </SimpleTable>
        </div>
        <PaginationFooter
          page={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
        </DataCard>
      </div>
    </PageShell>
  );
}
