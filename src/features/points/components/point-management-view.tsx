"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DateField,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  FormTextarea,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SelectItem,
  SimpleTable,
  StatTile,
  TableActions,
  TextField,
} from "@/components/shared/admin-kit";
import {
  PointHistoryBadge,
  PointProgramStatusBadge,
  PointRewardBadge,
} from "@/features/points/components/point-badges";
import { StampProgress } from "@/features/points/components/stamp-progress";
import {
  DEFAULT_POINT_PROGRAM,
  POINT_SUMMARY,
  POINT_TOTAL_COUNT,
  STATIC_POINT_ROWS,
  formatProgramRule,
  getRewardStatus,
} from "@/features/points/constants/point.mock";
import type { PointCardRow, PointProgramConfig } from "@/features/points/types/point.type";
import { autoColumns, downloadCsv } from "@/lib/export-csv";
import { usePagination } from "@/hooks/use-pagination";

const POINT_TABLE_HEADERS = [
  "No",
  "Card No.",
  "Customer",
  "Contact",
  "Stamp Progress",
  "Stamps",
  "Reward Status",
  "Last Activity",
  "Action",
] as const;

const HISTORY_TABLE_HEADERS = ["Date", "Type", "Description", "Staff", "Change"] as const;

function PointCustomerIdentity({ name }: { name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-black text-xs font-semibold text-[#befe35]"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="text-xs font-semibold text-[#1E1E1E]">{name}</span>
    </div>
  );
}

function PointContact({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="[&>p]:text-[.6875rem] [&>p]:leading-[1.35] [&>p]:text-gray-500 [&>p:first-child]:font-medium [&>p:first-child]:text-[#333333]">
      <p>{phone}</p>
      <p>{email}</p>
    </div>
  );
}

export default function PointManagementView() {
  const [program, setProgram] = useState<PointProgramConfig>(DEFAULT_POINT_PROGRAM);
  const [rows, setRows] = useState<PointCardRow[]>(STATIC_POINT_ROWS);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [programOpen, setProgramOpen] = useState(false);
  const [programDraft, setProgramDraft] = useState<PointProgramConfig>(DEFAULT_POINT_PROGRAM);
  const [programLoading, setProgramLoading] = useState(false);
  const [detailTarget, setDetailTarget] = useState<PointCardRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rewardStatus = getRewardStatus(
        row.currentStamps,
        program.stampsRequired,
        row.rewardStatus
      );

      const matchesKeyword =
        !keyword ||
        row.customerName.toLowerCase().includes(keyword.toLowerCase()) ||
        row.cardNo.toLowerCase().includes(keyword.toLowerCase()) ||
        row.phone.includes(keyword) ||
        row.email.toLowerCase().includes(keyword.toLowerCase());

      const matchesStatus =
        !statusFilter || rewardStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, program.stampsRequired, rows, statusFilter]);

  const openProgramModal = () => {
    setProgramDraft({ ...program });
    setProgramOpen(true);
  };

  const handleSaveProgram = async () => {
    if (!programDraft.stampsRequired || programDraft.stampsRequired < 1) {
      toast.error("Stamps required must be at least 1.");
      return;
    }
    if (!programDraft.rewardTitle.trim()) {
      toast.error("Please enter a reward title.");
      return;
    }

    setProgramLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setProgram({ ...programDraft });
      setRows((current) =>
        current.map((row) => ({
          ...row,
          rewardStatus: getRewardStatus(
            row.currentStamps,
            programDraft.stampsRequired,
            row.rewardStatus
          ),
        }))
      );
      setProgramOpen(false);
      toast.success("Stamp card program updated.");
    } finally {
      setProgramLoading(false);
    }
  };

  const openDetail = (row: PointCardRow) => {
    setDetailTarget(row);
    setDetailOpen(true);
  };

  const handleAddStamp = (row: PointCardRow) => {
    setRows((current) =>
      current.map((item) => {
        if (item.id !== row.id) return item;

        const nextStamps = Math.min(item.currentStamps + 1, program.stampsRequired + 2);
        const nextStatus = getRewardStatus(nextStamps, program.stampsRequired);

        return {
          ...item,
          currentStamps: nextStamps,
          lifetimeStamps: item.lifetimeStamps + 1,
          rewardStatus: nextStatus,
          lastActivity: "Just now",
          history: [
            {
              id: `h-${Date.now()}`,
              type: "Earned",
              date: "Just now",
              description: "Manual stamp added from admin panel",
              staff: "Admin Shop",
              stampChange: "+1",
            },
            ...item.history,
          ],
        };
      })
    );
    toast.success(`Stamp added for ${row.customerName}.`);
  };

  const handleRedeem = (row: PointCardRow) => {
    if (row.currentStamps < program.stampsRequired) {
      toast.error("Customer does not have enough stamps to redeem.");
      return;
    }

    setRows((current) =>
      current.map((item) => {
        if (item.id !== row.id) return item;

        return {
          ...item,
          currentStamps: program.resetAfterRedeem ? 0 : item.currentStamps - program.stampsRequired,
          lifetimeRedemptions: item.lifetimeRedemptions + 1,
          rewardStatus: program.resetAfterRedeem ? "Redeemed" : getRewardStatus(
            item.currentStamps - program.stampsRequired,
            program.stampsRequired
          ),
          lastActivity: "Just now",
          history: [
            {
              id: `h-${Date.now()}`,
              type: "Redeemed",
              date: "Just now",
              description: `Redeemed ${program.rewardTitle.toLowerCase()}`,
              staff: "Admin Shop",
              stampChange: `-${program.stampsRequired}`,
            },
            ...item.history,
          ],
        };
      })
    );
    toast.success(`Reward redeemed for ${row.customerName}.`);
    setDetailOpen(false);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setStatusFilter("");
    setDateRange(undefined);
  };

  const activePage = usePagination(filteredRows);

  const handleExport = () =>
    downloadCsv("point-cards", filteredRows as never[], autoColumns(filteredRows as never[]));

  return (
    <PageShell>
      <PageHeader
        title="Stamp Card Program"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Customer & Rating" },
          { label: "Points" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile title="Active Cards" value={String(POINT_SUMMARY.activeCards)} tone="gray" />
        <StatTile
          title="Ready to Redeem"
          value={String(POINT_SUMMARY.readyToRedeem)}
          tone="green"
        />
        <StatTile
          title="Redeemed This Month"
          value={String(POINT_SUMMARY.redeemedThisMonth)}
          tone="yellow"
        />
        <StatTile
          title="Stamps Issued Today"
          value={String(POINT_SUMMARY.stampsIssuedToday)}
          tone="orange"
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0px_19px_38px_rgba(32,33,36,.04)] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#1E1E1E]">Program Rules</h2>
            <PointProgramStatusBadge status={program.status} />
          </div>
          <p className="mt-2 text-sm font-medium text-[#1E1E1E]">{formatProgramRule(program)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Scope: {program.rewardScope}
            {program.rewardScope === "Selected Categories"
              ? ` · ${program.eligibleCategories.join(", ")}`
              : ""}
            {" · "}
            {program.resetAfterRedeem ? "Card resets after redeem" : "Stamps carry over after redeem"}
          </p>
        </div>
        <button type="button" className="btn_outline_black" onClick={openProgramModal}>
          Edit Program
        </button>
      </section>

      <FilterPanel defaultCollapsed={false}>
        <TextField
          label="Customer / Card No."
          placeholder="Search by name, card no., phone, or email"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <SelectField
          label="Reward Status"
          placeholder="All Statuses"
          value={statusFilter}
          onValueChange={(event) => setStatusFilter(event)}
        >
          <SelectItem value="collecting">Collecting</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="redeemed">Redeemed</SelectItem>
        </SelectField>
        <DateField label="Last Activity" value={dateRange} onChange={setDateRange} />
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <DataCard
        title="Customer Stamp Cards"
        meta={`Total Cards: ${POINT_TOTAL_COUNT}`}
        actions={
          <TableActions
            onExport={handleExport}
            onRegister={openProgramModal}
            primaryLabel="Program Settings"
          />
        }
      >
        <SimpleTable headers={[...POINT_TABLE_HEADERS]}>
          {activePage.pageRows.map((row, index) => {
            const rewardStatus = getRewardStatus(
              row.currentStamps,
              program.stampsRequired,
              row.rewardStatus
            );

            return (
              <Row key={row.id} striped={index % 2 === 1}>
                <Cell>{index + 1}</Cell>
                <Cell className="audit_cell_strong">{row.cardNo}</Cell>
                <Cell>
                  <PointCustomerIdentity name={row.customerName} />
                </Cell>
                <Cell>
                  <PointContact phone={row.phone} email={row.email} />
                </Cell>
                <Cell>
                  <StampProgress
                    current={row.currentStamps}
                    total={program.stampsRequired}
                    compact
                  />
                </Cell>
                <Cell>{row.currentStamps}</Cell>
                <Cell>
                  <PointRewardBadge status={rewardStatus} />
                </Cell>
                <Cell>{row.lastActivity}</Cell>
                <Cell>
                  <RowActions
                    onView={() => openDetail(row)}
                    onEdit={() => handleAddStamp(row)}
                  />
                </Cell>
              </Row>
            );
          })}
        </SimpleTable>
        <PaginationFooter
          page={activePage.page}
          totalPages={activePage.totalPages}
          pageSize={activePage.pageSize}
          onPageChange={activePage.setPage}
          onPageSizeChange={activePage.setPageSize}
        />
      </DataCard>

      <FormModal
        open={programOpen}
        onOpenChange={setProgramOpen}
        title="Stamp Card Program Settings"
        submitLabel="Save Changes"
        onSubmit={handleSaveProgram}
        isLoading={programLoading}
      >
        <ModalGrid>
          <FormInput
            label="Stamps Required"
            placeholder="e.g. 5"
            value={String(programDraft.stampsRequired)}
            onChange={(event) =>
              setProgramDraft({
                ...programDraft,
                stampsRequired: Number.parseInt(event.target.value, 10) || 0,
              })
            }
            required
          />
          <FormInput
            label="Reward Title"
            placeholder="e.g. 1 Free Drink of Choice"
            value={programDraft.rewardTitle}
            onChange={(event) =>
              setProgramDraft({ ...programDraft, rewardTitle: event.target.value })
            }
            required
          />
          <FormSelect
            label="Eligible Scope"
            value={programDraft.rewardScope}
            onValueChange={(event) =>
              setProgramDraft({
                ...programDraft,
                rewardScope: event as PointProgramConfig["rewardScope"],
              })
            }
            required
          >
            <SelectItem value="All Drinks">All Drinks</SelectItem>
            <SelectItem value="Selected Categories">Selected Categories</SelectItem>
          </FormSelect>
          <FormSelect
            label="Program Status"
            value={programDraft.status}
            onValueChange={(event) =>
              setProgramDraft({
                ...programDraft,
                status: event as PointProgramConfig["status"],
              })
            }
            required
          >
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
          </FormSelect>
          <FormInput
            label="Eligible Categories"
            placeholder="Drinks, Coffee"
            value={programDraft.eligibleCategories.join(", ")}
            onChange={(event) =>
              setProgramDraft({
                ...programDraft,
                eligibleCategories: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
          <FormSelect
            label="After Redeem"
            value={programDraft.resetAfterRedeem ? "reset" : "carry-over"}
            onValueChange={(event) =>
              setProgramDraft({
                ...programDraft,
                resetAfterRedeem: event === "reset",
              })
            }
          >
            <SelectItem value="reset">Reset card to 0 stamps</SelectItem>
            <SelectItem value="carry-over">Carry over remaining stamps</SelectItem>
          </FormSelect>
        </ModalGrid>
        <FormTextarea
          label="Terms & Conditions"
          placeholder="Describe reward rules for staff and customers"
          value={programDraft.terms}
          onChange={(event) =>
            setProgramDraft({ ...programDraft, terms: event.target.value })
          }
        />
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Stamp Card Detail"
      >
        {detailTarget && (() => {
          const activeDetail =
            rows.find((row) => row.id === detailTarget.id) ?? detailTarget;
          const detailStatus = getRewardStatus(
            activeDetail.currentStamps,
            program.stampsRequired,
            activeDetail.rewardStatus
          );

          return (
          <>
            <DetailGrid>
              <DetailItem label="Card No." value={activeDetail.cardNo} />
              <DetailItem label="Customer" value={activeDetail.customerName} />
              <DetailItem label="Phone" value={activeDetail.phone} />
              <DetailItem label="Email" value={activeDetail.email} />
              <DetailItem label="Joined" value={activeDetail.joinedDate} />
              <DetailItem
                label="Lifetime Redemptions"
                value={String(activeDetail.lifetimeRedemptions)}
              />
            </DetailGrid>

            <div className="mt-5 rounded-2xl bg-[#F6F6F6] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#1E1E1E]">Current Progress</h3>
                <PointRewardBadge status={detailStatus} />
              </div>
              <StampProgress
                current={activeDetail.currentStamps}
                total={program.stampsRequired}
              />
              <p className="mt-2.5 text-xs text-gray-500">{formatProgramRule(program)}</p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className="btn_outline_black"
                  onClick={() => handleAddStamp(activeDetail)}
                >
                  Add Stamp
                </button>
                {detailStatus === "Ready" && (
                  <button
                    type="button"
                    className="btn_primary_yellow"
                    onClick={() => handleRedeem(activeDetail)}
                  >
                    Redeem Reward
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-semibold text-[#1E1E1E]">Stamp Activity</h3>
              <SimpleTable headers={[...HISTORY_TABLE_HEADERS]}>
                {activeDetail.history.map((entry, index) => (
                  <Row key={entry.id} striped={index % 2 === 1}>
                    <Cell>{entry.date}</Cell>
                    <Cell>
                      <PointHistoryBadge type={entry.type} />
                    </Cell>
                    <Cell className="audit_cell_description">{entry.description}</Cell>
                    <Cell>{entry.staff}</Cell>
                    <Cell className="audit_cell_strong">{entry.stampChange}</Cell>
                  </Row>
                ))}
              </SimpleTable>
            </div>
          </>
          );
        })()}
      </DetailModal>
    </PageShell>
  );
}
