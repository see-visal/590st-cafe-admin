import Link from "next/link";
import { PageShell } from "./PageShell";
import { PageHeader } from "./PageHeader";
import { AdminTopActions } from "./AdminKit";

export function UnavailableFeature({ title, description, href, linkLabel }: {
  title: string; description: string; href?: string; linkLabel?: string;
}) {
  return <PageShell>
    <PageHeader title={title} breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]} rightSlot={<AdminTopActions />} />
    <section className="rounded-xl border p-6">
      <h2 className="font-semibold">{title} is not available yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {href && <Link href={href} className="mt-4 inline-block text-sm underline">{linkLabel}</Link>}
    </section>
  </PageShell>;
}
