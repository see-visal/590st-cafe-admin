import { InventoryDetailView } from "@/features/inventory";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InventoryDetailView productId={id} />;
}
