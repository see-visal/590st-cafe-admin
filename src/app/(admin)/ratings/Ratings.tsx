"use client";

import { useState } from "react";
import { PageShell } from "@/components/cafe/PageShell";
import { PageHeader } from "@/components/cafe/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FilterPanel,
  PaginationFooter,
  Row,
  SimpleTable,
  StatTile,
  StatusBadge,
  TextField,
} from "@/components/cafe/AdminKit";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";

const REVIEWS_DATA = [
  {
    id: 1,
    customer: "Visal Soeurn",
    rating: 5,
    comment: "The ESPRESSO is outstanding! Rich flavor and perfect crema. My daily go-to drink.",
    productName: "ESPRESSO",
    date: "2026-06-02",
    status: "APPROVED",
  },
  {
    id: 2,
    customer: "Ream Chan",
    rating: 4,
    comment: "Strawberry Soda is extremely refreshing. Perfectly balanced sweetness. Service was fast too.",
    productName: "Strawberry Soda",
    date: "2026-06-01",
    status: "APPROVED",
  },
  {
    id: 3,
    customer: "Socheat Neang",
    rating: 4,
    comment: "A bit crowded during lunch hours, but the 590 Coffee is worth the wait. Very smooth.",
    productName: "590 Coffee",
    date: "2026-05-30",
    status: "APPROVED",
  },
  {
    id: 4,
    customer: "Bopha Pich",
    rating: 5,
    comment: " Carlberg Beer was perfectly chilled! Friendly staff and comfortable seating space.",
    productName: "Carlsberg Beer ដប",
    date: "2026-05-29",
    status: "APPROVED",
  },
  {
    id: 5,
    customer: "Dara Kong",
    rating: 3,
    comment: "Noodles were decent but could use more seasoning. Iced Latte was very good though.",
    productName: "មីគោក ១កញ្ចប់",
    date: "2026-05-28",
    status: "FLAGGED",
  },
];

export default function Ratings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");

  const filteredReviews = REVIEWS_DATA.filter((r) => {
    const matchesSearch =
      r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !ratingFilter || r.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  return (
    <PageShell>
      <PageHeader
        title="Ratings & Reviews"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Ratings" }]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatTile title="Average Rating" value="4.6 / 5.0" hint="From 128 lifetime reviews" />
        <StatTile title="Total Reviews" value="128" hint="Approved ratings" />
        <StatTile title="Positive (4-5★)" value="92%" tone="green" hint="Excellent customer satisfaction" />
        <StatTile title="Pending Review" value="3" tone="orange" hint="Awaiting approval" />
      </div>

      {/* Star distribution */}
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentages = { 5: 75, 4: 17, 3: 5, 2: 2, 1: 1 }[stars] || 0;
            return (
              <div key={stars} className="flex items-center gap-4">
                <span className="flex w-12 items-center gap-1 text-sm font-semibold">
                  {stars} <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentages}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-gray-500">{percentages}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <FilterPanel>
        <TextField
          label="Search Review"
          placeholder="Search by customer, comment, product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700">
          Filter by Star
          <span className="relative mt-2 block">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
              className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-500 outline-none"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </span>
        </label>
      </FilterPanel>

      <DataCard title="Reviews History" meta={`Reviews found: ${filteredReviews.length}`}>
        <SimpleTable headers={["No", "Customer", "Product", "Rating", "Comment", "Date", "Status"]}>
          {filteredReviews.map((review, index) => (
            <Row key={review.id} striped={index % 2 === 1}>
              <Cell>{index + 1}</Cell>
              <Cell className="font-semibold">{review.customer}</Cell>
              <Cell>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-800">
                  {review.productName}
                </span>
              </Cell>
              <Cell>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </Cell>
              <Cell className="max-w-xs truncate" title={review.comment}>
                {review.comment}
              </Cell>
              <Cell>{new Date(review.date).toLocaleDateString()}</Cell>
              <Cell>
                <StatusBadge
                  label={review.status}
                  variant={review.status === "APPROVED" ? "success" : "destructive"}
                />
              </Cell>
            </Row>
          ))}
        </SimpleTable>
        <PaginationFooter />
      </DataCard>
    </PageShell>
  );
}
