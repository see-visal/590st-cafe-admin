import PromotionDetailView from "@/features/promotion/components/PromotionDetailView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PromotionDetailView promotionId={id} />;
}
