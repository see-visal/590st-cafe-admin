import { UnavailableFeature } from "@/components/common/UnavailableFeature";

export default function Page() {
  return <UnavailableFeature title="Tables" description="Table assignments and floor plans are not available yet. You can review order notes on the Orders screen." href="/orders" linkLabel="View orders" />;
}
