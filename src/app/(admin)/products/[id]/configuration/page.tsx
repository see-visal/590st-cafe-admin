import ProductConfigurationView from "@/features/product/components/ProductConfigurationView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductConfigurationView productId={id} />;
}
