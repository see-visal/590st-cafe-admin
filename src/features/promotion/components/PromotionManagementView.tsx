import { UnavailableFeature } from "@/components/common/UnavailableFeature";

export default function PromotionManagementView() {
  return <UnavailableFeature title="Promotion codes"
    description="Promotion codes and redemption tracking are not supported yet. You can manage product discounts on the Products page."
    href="/products" linkLabel="Manage product discounts" />;
}