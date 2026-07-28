import InventoryDetailView from "@/features/inventory/components/InventoryDetailView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InventoryDetailView productId={id} />;
}
