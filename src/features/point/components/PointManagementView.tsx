import { UnavailableFeature } from "@/components/common/UnavailableFeature";

export default function PointManagementView() {
  return <UnavailableFeature title="Loyalty points"
    description="A loyalty program has not been set up. Customer accounts are available in the Customers directory."
    href="/customers" linkLabel="View customer accounts" />;
}