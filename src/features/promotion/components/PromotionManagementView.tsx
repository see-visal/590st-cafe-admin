"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  CheckBox,
  DataCard,
  DateField,
  FilterActions,
  FilterPanel,
  FormDateField,
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
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import {
  EMPTY_PROMOTION_FORM,
  PROMOTION_CATEGORY_OPTIONS,
  PROMOTION_PRODUCT_OPTIONS,
  PROMOTION_TOTAL_COUNT,
  STATIC_PROMOTION_ROWS,
  toPromotionForm,
  type PromotionFormFields,
  type PromotionListRow,
  type PromotionStatus,
  type PromotionType,
} from "@/features/promotion/constants/promotion.mock";
import { cn } from "@/lib/utils";

const PROMOTION_TABLE_HEADERS = [
  "No",
  "",
  "Promo Code",
  "Promotion Name",
  "Type",
  "Value",
  "Min. Purchase",
  "Usage / Limit",
  "Start Date",
  "Expire Date",
  "Status",
  "Action",
] as const;

function PromotionTypeBadge({ type }: { type: PromotionType }) {
  const toneClass = {
    Percentage: "is_percentage",
    "Fixed Amount": "is_fixed",
    "Buy X Get Y": "is_bogo",
  }[type];

  return (
    <span className={cn("promotion_type_badge", toneClass)}>{type}</span>
  );
}

function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const toneClass = {
    Active: "is_active",
    Expired: "is_expired",
    Scheduled: "is_scheduled",
  }[status];

  return (
    <span className={cn("promotion_status_badge", toneClass)}>{status}</span>
  );
}

export default function PromotionManagementView() {
  const [promoCode, setPromoCode] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formFields, setFormFields] = useState<PromotionFormFields>(
    EMPTY_PROMOTION_FORM
  );

  const filteredRows = useMemo(() => {
    return STATIC_PROMOTION_ROWS.filter((row) => {
      const matchesCode =
        !promoCode ||
        row.promoCode.toLowerCase().includes(promoCode.toLowerCase()) ||
        row.name.toLowerCase().includes(promoCode.toLowerCase());

      const matchesType =
        !typeFilter ||
        row.type.toLowerCase().replace(/\s+/g, "-") === typeFilter;

      const matchesStatus =
        !statusFilter || row.status.toLowerCase() === statusFilter;

      return matchesCode && matchesType && matchesStatus;
    });
  }, [promoCode, typeFilter, statusFilter]);

  const handleOpenForm = (row?: PromotionListRow) => {
    setIsEditing(Boolean(row));
    setFormFields(row ? toPromotionForm(row) : { ...EMPTY_PROMOTION_FORM });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setFormFields({ ...EMPTY_PROMOTION_FORM });
  };

  const handleSubmit = async () => {
    if (
      !formFields.promoCode.trim() ||
      !formFields.name.trim() ||
      !formFields.type ||
      !formFields.value.trim() ||
      !formFields.usageLimit.trim() ||
      !formFields.startDate ||
      !formFields.expireDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(
        isEditing ? "Promotion updated successfully." : "Promotion created successfully."
      );
      handleCloseForm();
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Promotion List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Promotions" },
          { label: "Promotion List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <FilterPanel defaultCollapsed={false}>
        <TextField
          label="Promotion Code"
          placeholder="e.g. COFFEE20"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <SelectField
          label="Type"
          placeholder="All Types"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed-amount">Fixed Amount</option>
          <option value="buy-x-get-y">Buy X Get Y</option>
        </SelectField>
        <SelectField
          label="Status"
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="scheduled">Scheduled</option>
        </SelectField>
        <DateField
          label="Date Range"
          value={dateRange}
          onChange={setDateRange}
        />
        <FilterActions />
      </FilterPanel>

      <DataCard
        title="Promotion Directory"
        meta={`Total Promotions: ${PROMOTION_TOTAL_COUNT}`}
        actions={
          <TableActions
            onRegister={() => handleOpenForm()}
            primaryLabel="Create Promotion"
          />
        }
      >
        <SimpleTable headers={[...PROMOTION_TABLE_HEADERS]}>
          {filteredRows.map((row: PromotionListRow, index) => (
            <Row key={row.id} striped={index % 2 === 1}>
              <Cell>{index + 1}</Cell>
              <Cell>
                <CheckBox />
              </Cell>
              <Cell>{row.promoCode}</Cell>
              <Cell>{row.name}</Cell>
              <Cell>
                <PromotionTypeBadge type={row.type} />
              </Cell>
              <Cell>{row.value}</Cell>
              <Cell>{row.minPurchase}</Cell>
              <Cell>{row.usageLimit}</Cell>
              <Cell>{row.startDate}</Cell>
              <Cell>{row.expireDate}</Cell>
              <Cell>
                <PromotionStatusBadge status={row.status} />
              </Cell>
              <Cell>
                <RowActions
                  onView={() => undefined}
                  onEdit={() => handleOpenForm(row)}
                  onHistory={() => undefined}
                />
              </Cell>
            </Row>
          ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}
        title={isEditing ? "Promotion Register/Modify" : "Create Promotion"}
        submitLabel={isEditing ? "Submit" : "Create"}
        onSubmit={handleSubmit}
        isLoading={submitLoading}
      >
        <ModalGrid>
          <FormInput
            label="Promotion Code"
            placeholder="e.g. COFFEE20"
            value={formFields.promoCode}
            onChange={(e) =>
              setFormFields({ ...formFields, promoCode: e.target.value })
            }
            required
          />
          <FormInput
            label="Promotion Name"
            placeholder="Enter promotion name"
            value={formFields.name}
            onChange={(e) =>
              setFormFields({ ...formFields, name: e.target.value })
            }
            required
          />
          <FormSelect
            label="Type"
            placeholder="Select type"
            value={formFields.type}
            onChange={(e) =>
              setFormFields({
                ...formFields,
                type: e.target.value as PromotionType,
              })
            }
            required
          >
            <option value="Percentage">Percentage</option>
            <option value="Fixed Amount">Fixed Amount</option>
            <option value="Buy X Get Y">Buy X Get Y</option>
          </FormSelect>
          <FormInput
            label="Value"
            placeholder="e.g. 20"
            value={formFields.value}
            onChange={(e) =>
              setFormFields({ ...formFields, value: e.target.value })
            }
            required
          />
          <FormInput
            label="Min. Purchase"
            placeholder="e.g. 10.00"
            value={formFields.minPurchase}
            onChange={(e) =>
              setFormFields({ ...formFields, minPurchase: e.target.value })
            }
          />
          <FormInput
            label="Usage Limit"
            placeholder="e.g. 100"
            value={formFields.usageLimit}
            onChange={(e) =>
              setFormFields({ ...formFields, usageLimit: e.target.value })
            }
            required
          />
          <FormDateField
            label="Start Date"
            placeholder="Select start date"
            value={formFields.startDate}
            onChange={(date) =>
              setFormFields({ ...formFields, startDate: date })
            }
            required
          />
          <FormDateField
            label="Expire Date"
            placeholder="Select expiration date"
            value={formFields.expireDate}
            onChange={(date) =>
              setFormFields({ ...formFields, expireDate: date })
            }
            required
          />
          <FormSelect
            label="Applicable Categories"
            placeholder="Select categories"
            value={formFields.categories}
            onChange={(e) =>
              setFormFields({ ...formFields, categories: e.target.value })
            }
          >
            {PROMOTION_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Applicable Products"
            placeholder="Select products"
            value={formFields.products}
            onChange={(e) =>
              setFormFields({ ...formFields, products: e.target.value })
            }
          >
            {PROMOTION_PRODUCT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
          <div className="md:col-span-3">
            <FormTextarea
              label="Description / Terms"
              placeholder="Enter promotion description and terms..."
              value={formFields.description}
              onChange={(e) =>
                setFormFields({ ...formFields, description: e.target.value })
              }
              rows={4}
            />
          </div>
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
