"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FormCategoryMultiSelect,
  FormDateField,
  FormInput,
  FormModal,
  FormSelect,
  FormTextarea,
  ModalGrid,
  SelectItem,
} from "@/components/shared/admin-kit";
import {
  EMPTY_PROMOTION_FORM,
  PROMOTION_CATEGORY_OPTIONS,
  PROMOTION_PRODUCT_OPTIONS,
  toPromotionEditForm,
} from "@/features/promotions/constants/promotion.mock";
import type {
  PromotionDetail,
  PromotionEditFormFields,
  PromotionType,
} from "@/features/promotions/types/promotion.type";

export default function PromotionEditModal({
  open,
  onOpenChange,
  promotion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: PromotionDetail | null;
}) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formFields, setFormFields] = useState<PromotionEditFormFields>({
    ...EMPTY_PROMOTION_FORM,
    selectedCategories: [],
  });

  useEffect(() => {
    if (open && promotion) {
      setFormFields(toPromotionEditForm(promotion));
    }
  }, [open, promotion]);

  const handleClose = () => {
    onOpenChange(false);
    setFormFields({ ...EMPTY_PROMOTION_FORM, selectedCategories: [] });
  };

  const handleSubmit = async () => {
    if (
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
      toast.success("Promotion updated successfully.");
      handleClose();
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
      title="Edit Promotion"
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      isLoading={submitLoading}
    >
      <ModalGrid>
        <FormInput
          label="Promotion Code"
          placeholder="e.g. COFFEE20"
          value={formFields.promoCode}
          readOnly
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
          onValueChange={(e) =>
            setFormFields({
              ...formFields,
              type: e as PromotionType,
            })
          }
          required
        >
          <SelectItem value="Percentage">Percentage</SelectItem>
          <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
          <SelectItem value="Buy X Get Y">Buy X Get Y</SelectItem>
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
        <FormCategoryMultiSelect
          label="Applicable Categories"
          placeholder="Select categories"
          options={PROMOTION_CATEGORY_OPTIONS}
          value={formFields.selectedCategories}
          onChange={(selectedCategories) =>
            setFormFields({ ...formFields, selectedCategories })
          }
        />
        <FormSelect
          label="Applicable Products"
          placeholder="Select products"
          value={formFields.products}
          onValueChange={(e) =>
            setFormFields({ ...formFields, products: e })
          }
        >
          {PROMOTION_PRODUCT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
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
  );
}
