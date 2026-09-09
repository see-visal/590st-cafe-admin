"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Ban, Download, Pencil } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
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
} from "@/components/common/AdminKit";
import PromotionEditModal from "@/features/promotion/components/PromotionEditModal";
import {
  PromotionStatusBadge,
  PromotionTypeBadge,
} from "@/features/promotion/components/PromotionBadges";
import {
  formatUsd,
  getPromotionDetailById,
  getRedemptionHistory,
  type PromotionStatus,
} from "@/features/promotion/constants/promotion.mock";
import { cn } from "@/lib/utils";

function UsageProgress({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="promotion_detail_usage">
      <div className="promotion_detail_usage_head">
        <span className="promotion_detail_chip_label">Usage / Limit</span>
        <span className="promotion_detail_usage_value">
          {used} / {total}
        </span>
      </div>
      <div
        className="promotion_detail_progress_track"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Promotion usage ${used} of ${total}`}
      >
        <span
          className="promotion_detail_progress_fill"
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
    <div className="promotion_detail_chip">
      <span className="promotion_detail_chip_label">{label}</span>
      <div className="promotion_detail_chip_value">{children}</div>
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
    <div className="promotion_detail_stat">
      <p className="promotion_detail_stat_label">{label}</p>
      <p
        className={cn(
          "promotion_detail_stat_value",
          tone === "discount" && "is_discount"
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

      <section className="promotion_detail_summary">
        <div className="promotion_detail_hero">
          <div className="promotion_detail_identity">
            <div className="promotion_detail_title_row">
              <div>
                <h2 className="promotion_detail_code">{promotion.promoCode}</h2>
                <p className="promotion_detail_name">{promotion.name}</p>
              </div>
              <PromotionStatusBadge status={promotion.status} />
            </div>

            <div className="promotion_detail_chip_row">
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

            <div className="promotion_detail_dates">
              <div>
                <p className="promotion_detail_date_label">Start Date</p>
                <p className="promotion_detail_date_value">{promotion.startDate}</p>
              </div>
              <div>
                <p className="promotion_detail_date_label">Expire Date</p>
                <p className="promotion_detail_date_value">{promotion.expireDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="promotion_detail_stats_panel">
          <h3 className="promotion_detail_stats_title">Usage Statistics</h3>
          <div className="promotion_detail_stats_grid">
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

        <div className="promotion_detail_actions">
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
              className="btn_outline_black promotion_detail_disable_btn"
              onClick={() => setDisableConfirmOpen(true)}
            >
              Disable
              <Ban />
            </button>
          )}
        </div>
      </section>

      <DataCard title="Promotion Details">
        <div className="promotion_detail_info_wrap">
          <DetailGrid>
            <DetailItem label="Description">{promotion.description}</DetailItem>
            <DetailItem label="Applicable Categories">
              <div className="promotion_detail_tags">
                {promotion.applicableCategories.map((category) => (
                  <span key={category} className="promotion_detail_tag">
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
          <p className="promotion_detail_empty_history">
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
              {redemptions.map((row, index) => (
                <Row key={row.id} striped={index % 2 === 1}>
                  <Cell>{row.date}</Cell>
                  <Cell>
                    <span className="font-semibold">{row.orderId}</span>
                  </Cell>
                  <Cell>{row.customer}</Cell>
                  <Cell>{formatUsd(row.originalAmount)}</Cell>
                  <Cell>
                    <span className="settlement_amount is_refund">
                      -{formatUsd(row.discount)}
                    </span>
                  </Cell>
                  <Cell>{formatUsd(row.finalAmount)}</Cell>
                  <Cell>{row.staff}</Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter />
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
