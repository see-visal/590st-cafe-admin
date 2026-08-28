"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Ban, Download, Pencil } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminStatusAlert,
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailItem,
  PaginationFooter,
  Row,
  SimpleTable,
} from "@/components/shared/admin-kit";
import PromotionEditModal from "@/features/promotions/components/promotion-edit-modal";
import {
  PromotionStatusBadge,
  PromotionTypeBadge,
} from "@/features/promotions/components/promotion-badges";
import {
  getPromotionDetailById,
  getRedemptionHistory,
} from "@/features/promotions/constants/promotion.mock";
import type { PromotionStatus } from "@/features/promotions/types/promotion.type";
import { formatUsd } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";

function UsageProgress({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="min-h-[72px] rounded-lg border border-[#EDEDED] bg-[#F4F4F4] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs leading-tight text-gray-500">Usage / Limit</span>
        <span className="text-sm font-bold text-[#1E1E1E]">
          {used} / {total}
        </span>
      </div>
      <div
        className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EDEDED]"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Promotion usage ${used} of ${total}`}
      >
        <span
          className="block h-full rounded-full bg-[#befe35] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SummaryChip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[72px] rounded-lg border border-[#EDEDED] bg-[#F4F4F4] px-3.5 py-3">
      <span className="text-xs leading-tight text-gray-500">{label}</span>
      <div className="mt-2 text-sm font-semibold text-[#1E1E1E]">{children}</div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "discount";
}) {
  return (
    <div className="rounded-lg border border-[#EDEDED] bg-white px-4 py-3.5">
      <p className="text-xs leading-tight text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-xl font-bold leading-tight",
          tone === "discount" ? "text-red-600" : "text-[#1E1E1E]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function PromotionDetailView({ promotionId }: { promotionId: string }) {
  const basePromotion = useMemo(
    () => getPromotionDetailById(promotionId),
    [promotionId]
  );
  const redemptions = useMemo(
    () => getRedemptionHistory(promotionId),
    [promotionId]
  );

  const [statusOverride, setStatusOverride] = useState<PromotionStatus | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [disableSuccessOpen, setDisableSuccessOpen] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const promotion = useMemo(() => {
    if (!basePromotion) return undefined;
    if (!statusOverride) return basePromotion;
    return { ...basePromotion, status: statusOverride };
  }, [basePromotion, statusOverride]);

  const handleConfirmDisable = async () => {
    setDisableLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStatusOverride("Expired");
      setDisableConfirmOpen(false);
      setDisableSuccessOpen(true);
    } finally {
      setDisableLoading(false);
    }
  };

  const activePage = usePagination(redemptions);

  if (!promotion) {
    return (
      <PageShell>
        <PageHeader
          title="Promotion Detail"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Promotion", href: "/promotions" },
            { label: "Promotion List", href: "/promotions" },
          ]}
          rightSlot={<AdminTopActions />}
          titleAction={
            <Link href="/promotions" className="btn_outline_black">
              Back to List
            </Link>
          }
        />
        <div className="py-12 text-center text-gray-500">Promotion not found.</div>
      </PageShell>
    );
  }

  const isActive = promotion.status === "Active";

  return (
    <PageShell>
      <PageHeader
        title="Promotion Detail"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Promotion", href: "/promotions" },
          { label: "Promotion List", href: "/promotions" },
        ]}
        rightSlot={<AdminTopActions />}
        titleAction={
          <Link href="/promotions" className="btn_outline_black">
            Back to List
          </Link>
        }
      />

      <section className="overflow-hidden rounded-lg bg-white shadow-[0px_19px_38px_0px_rgba(32,33,36,0.04)]">
        <div className="border-b border-[#EDEDED] px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold leading-tight text-[#1E1E1E]">{promotion.promoCode}</h2>
                <p className="mt-1.5 text-sm leading-[1.4] text-gray-500">{promotion.name}</p>
              </div>
              <PromotionStatusBadge status={promotion.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryChip label="Type">
                <PromotionTypeBadge type={promotion.type} />
              </SummaryChip>
              <SummaryChip label="Value">{promotion.value}</SummaryChip>
              <SummaryChip label="Min. Purchase">
                {promotion.minPurchase}
              </SummaryChip>
              <UsageProgress
                used={promotion.usageUsed}
                total={promotion.usageTotal}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-6 border-t border-[#EDEDED] pt-5">
              <div>
                <p className="text-xs leading-tight text-gray-500">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-[#1E1E1E]">{promotion.startDate}</p>
              </div>
              <div>
                <p className="text-xs leading-tight text-gray-500">Expire Date</p>
                <p className="mt-1 text-sm font-semibold text-[#1E1E1E]">{promotion.expireDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#EDEDED] bg-[#F8F7F3] px-6 py-5">
          <h3 className="mb-3.5 text-sm font-semibold text-[#1E1E1E]">Usage Statistics</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBlock
              label="Total Redemptions"
              value={String(promotion.totalRedemptions)}
            />
            <StatBlock
              label="Remaining Limit"
              value={String(promotion.remainingLimit)}
            />
            <StatBlock
              label="Average Order Value"
              value={formatUsd(promotion.averageOrderValue)}
            />
            <StatBlock
              label="Total Discount Given"
              value={`-${formatUsd(promotion.totalDiscountGiven)}`}
              tone="discount"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 bg-white px-6 py-4">
          <button
            type="button"
            className="btn_primary_black"
            onClick={() => setEditOpen(true)}
          >
            Edit Promotion
            <Pencil />
          </button>
          {isActive && (
            <button
              type="button"
              className="btn_outline_black [&_svg]:text-red-600"
              onClick={() => setDisableConfirmOpen(true)}
            >
              Disable
              <Ban />
            </button>
          )}
        </div>
      </section>

      <DataCard title="Promotion Details">
        <div className="pt-1 pb-2">
          <DetailGrid>
            <DetailItem label="Description">{promotion.description}</DetailItem>
            <DetailItem label="Applicable Categories">
              <div className="flex flex-wrap gap-2">
                {promotion.applicableCategories.map((category) => (
                  <span key={category} className="inline-flex rounded-full border border-[#CED1D8] bg-[#F4F4F4] px-2.5 py-1 text-xs font-semibold text-[#333333]">
                    {category}
                  </span>
                ))}
              </div>
            </DetailItem>
            <DetailItem label="Applicable Products">
              {promotion.applicableProductsLabel}
            </DetailItem>
            <DetailItem label="Terms & Conditions">{promotion.terms}</DetailItem>
          </DetailGrid>
        </div>
      </DataCard>

      <DataCard
        title="Redemption History"
        meta={`Total records: ${redemptions.length}`}
        actions={
          <button type="button" className="btn_outline_black">
            Export History
            <Download />
          </button>
        }
      >
        {redemptions.length === 0 ? (
          <p className="px-1 py-6 text-sm text-gray-500">
            No redemptions recorded for this promotion yet.
          </p>
        ) : (
          <>
            <SimpleTable
              headers={[
                "Date",
                "Order ID",
                "Customer",
                "Original Amount",
                "Discount",
                "Final Amount",
                "Staff",
              ]}
            >
              {activePage.pageRows.map((row, index) => (
                <Row key={row.id} striped={index % 2 === 1}>
                  <Cell>{row.date}</Cell>
                  <Cell>
                    <span className="font-semibold">{row.orderId}</span>
                  </Cell>
                  <Cell>{row.customer}</Cell>
                  <Cell>{formatUsd(row.originalAmount)}</Cell>
                  <Cell>
                    <span className="text-xs font-medium text-red-600">
                      -{formatUsd(row.discount)}
                    </span>
                  </Cell>
                  <Cell>{formatUsd(row.finalAmount)}</Cell>
                  <Cell>{row.staff}</Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter
              page={activePage.page}
              totalPages={activePage.totalPages}
              pageSize={activePage.pageSize}
              onPageChange={activePage.setPage}
              onPageSizeChange={activePage.setPageSize}
            />
          </>
        )}
      </DataCard>

      <PromotionEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        promotion={promotion}
      />

      <AdminStatusAlert
        open={disableConfirmOpen}
        onOpenChange={setDisableConfirmOpen}
        variant="confirm"
        title="Are you sure you want to disable this promotion?"
        headline={promotion.promoCode}
        description={`${promotion.name} will no longer be available at checkout once disabled.`}
        confirmLabel="Yes, Disable"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDisable}
        isLoading={disableLoading}
      />

      <AdminStatusAlert
        open={disableSuccessOpen}
        onOpenChange={setDisableSuccessOpen}
        variant="success"
        title="Promotion Disabled Successfully"
        headline={promotion.promoCode}
        description={`${promotion.name} has been disabled and moved to expired status.`}
        confirmLabel="Okay"
      />
    </PageShell>
  );
}
