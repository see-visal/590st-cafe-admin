"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
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
  SimpleTable,
  StatTile,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import {
  PointHistoryBadge,
  PointProgramStatusBadge,
  PointRewardBadge,
} from "@/features/point/components/PointBadges";
import { StampProgress } from "@/features/point/components/StampProgress";
import {
  DEFAULT_POINT_PROGRAM,
  POINT_SUMMARY,
  POINT_TOTAL_COUNT,
  STATIC_POINT_ROWS,
  formatProgramRule,
  getRewardStatus,
  type PointCardRow,
  type PointProgramConfig,
} from "@/features/point/constants/point.mock";

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
    <div className="point_customer_identity">
      <span className="point_customer_avatar" aria-hidden>
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="point_customer_name">{name}</span>
    </div>
  );
}

function PointContact({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="point_contact">
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

      <section className="point_summary_grid">
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

      <section className="point_program_banner">
        <div>
          <div className="point_program_banner_head">
            <h2>Program Rules</h2>
            <PointProgramStatusBadge status={program.status} />
          </div>
          <p className="point_program_banner_rule">{formatProgramRule(program)}</p>
          <p className="point_program_banner_meta">
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
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="collecting">Collecting</option>
          <option value="ready">Ready</option>
          <option value="redeemed">Redeemed</option>
        </SelectField>
        <DateField label="Last Activity" value={dateRange} onChange={setDateRange} />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Customer Stamp Cards"
        meta={`Total Cards: ${POINT_TOTAL_COUNT}`}
        actions={
          <TableActions
            onRegister={openProgramModal}
            primaryLabel="Program Settings"
          />
        }
      >
        <SimpleTable headers={[...POINT_TABLE_HEADERS]}>
          {filteredRows.map((row, index) => {
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
        <PaginationFooter />
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
            onChange={(event) =>
              setProgramDraft({
                ...programDraft,
                rewardScope: event.target.value as PointProgramConfig["rewardScope"],
              })
            }
            required
          >
            <option value="All Drinks">All Drinks</option>
            <option value="Selected Categories">Selected Categories</option>
          </FormSelect>
          <FormSelect
            label="Program Status"
            value={programDraft.status}
            onChange={(event) =>
              setProgramDraft({
                ...programDraft,
                status: event.target.value as PointProgramConfig["status"],
              })
            }
            required
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
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
            onChange={(event) =>
              setProgramDraft({
                ...programDraft,
                resetAfterRedeem: event.target.value === "reset",
              })
            }
          >
            <option value="reset">Reset card to 0 stamps</option>
            <option value="carry-over">Carry over remaining stamps</option>
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

            <div className="point_detail_progress">
              <div className="point_detail_progress_head">
                <h3>Current Progress</h3>
                <PointRewardBadge status={detailStatus} />
              </div>
              <StampProgress
                current={activeDetail.currentStamps}
                total={program.stampsRequired}
              />
              <p className="point_detail_rule">{formatProgramRule(program)}</p>
              <div className="point_detail_actions">
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

            <div className="point_history_section">
              <h3>Stamp Activity</h3>
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
