"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
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
  SimpleTable,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import {
  AuditActionBadge,
  AuditRoleBadge,
} from "@/features/audit/components/AuditBadges";
import {
  AUDIT_TOTAL_COUNT,
  STATIC_AUDIT_ROWS,
  type AuditAction,
  type AuditEntity,
  type AuditLogRow,
  type AuditRole,
} from "@/features/audit/constants/audit.mock";

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
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="system">System</option>
          <option value="barista">Barista</option>
          <option value="manager">Manager</option>
        </SelectField>
        <SelectField
          label="Entity"
          placeholder="All Entities"
          value={entityFilter}
          onChange={(event) => setEntityFilter(event.target.value)}
        >
          <option value="product">Product</option>
          <option value="order">Order</option>
          <option value="promotion">Promotion</option>
          <option value="inventory">Inventory</option>
          <option value="settings">Settings</option>
          <option value="staff">Staff</option>
        </SelectField>
        <SelectField
          label="Action"
          placeholder="All Actions"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
        >
          <option value="updated">Updated</option>
          <option value="created">Created</option>
          <option value="adjusted">Adjusted</option>
          <option value="login">Login</option>
        </SelectField>
        <DateField label="Date Range" value={dateRange} onChange={setDateRange} />
        <FilterActions />
      </FilterPanel>

      <div className="audit_data_card">
        <DataCard
          title="Audit Log"
          meta={`Total Records: ${AUDIT_TOTAL_COUNT}`}
          actions={<TableActions showRegister={false} />}
        >
        <div className="audit_table_wrap">
          <SimpleTable headers={[...AUDIT_TABLE_HEADERS]}>
            {filteredRows.map((row, index) => (
              <Row key={row.id} striped={index % 2 === 1}>
                <Cell className="audit_cell_strong">{row.auditId}</Cell>
                <Cell>{row.timestamp}</Cell>
                <Cell className="audit_cell_strong">{row.actor}</Cell>
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
                <Cell className="audit_cell_description">{row.description}</Cell>
                <Cell>{row.ipAddress}</Cell>
              </Row>
            ))}
          </SimpleTable>
        </div>
        <PaginationFooter />
        </DataCard>
      </div>
    </PageShell>
  );
}
