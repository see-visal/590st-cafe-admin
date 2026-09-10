import { redirect } from "next/navigation";

// Products are created through the modal on the products list, so this legacy route just
// sends visitors there rather than 404-ing on a bookmark.
export default function Page() {
  redirect("/products");
}
