"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import {
  AdminTopActions,
  Cell,
  DataCard,
  DetailGrid,
  DetailItem,
  DetailModal,
  FilterActions,
  FilterPanel,
  FormInput,
  FormModal,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SelectField,
  SelectItem,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/shared/admin-kit";
import {
  STATIC_CUSTOMER_ROWS,
  EMPTY_CUSTOMER_FORM,
  toCustomerDetail,
  toCustomerForm,
  type CustomerDetailView,
  type CustomerFormFields,
  type CustomerListRow,
} from "@/features/customers/constants/customer.mock";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { customerApi } from "@/features/customers/api/customer-api";
import toast from "react-hot-toast";
import { PILL_BASE } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { autoColumns, downloadCsv } from "@/lib/export-csv";
import { usePagination } from "@/hooks/use-pagination";

interface BackendCustomer {
  id: number;
  name: string;
  contact: string;
  status: string;
  createdAt: string;
}

function getStatusTone(status: string): "success" | "danger" {
  return status.toLowerCase() === "active" || status === "ACTIVE"
    ? "success"
    : "danger";
}

function getStatusLabel(status: string) {
  if (status === "ACTIVE") return "Active";
  if (status === "INACTIVE") return "InActive";
  return status;
}

function CustomerIdentity({ name }: { name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-md bg-black text-sm font-semibold text-[#befe35]"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="text-xs font-semibold text-[#333333]">{name}</span>
    </div>
  );
}

function CustomerContact({ email, phone }: { email: string; phone: string }) {
  return (
    <div>
      <p className="text-xs font-medium leading-tight text-[#333333]">{email}</p>
      <p className="mt-0.5 text-[.6875rem] leading-tight text-gray-400">{phone}</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={cn(
        PILL_BASE,
        tier === "Gold"
          ? "bg-lime-100 text-lime-800"
          : "bg-green-100 text-green-700"
      )}
    >
      {tier}
    </span>
  );
}

function CustomerStatusCell({
  status,
  locked = false,
}: {
  status: string;
  locked?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge label={status} tone={getStatusTone(status)} />
      {locked && <span className="cursor-pointer text-xs font-semibold text-red-600 underline">Locked</span>}
    </div>
  );
}

export default function Customers() {
  const { customers, refetch } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<BackendCustomer | null>(null);
  const [detailView, setDetailView] = useState<CustomerDetailView | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formFields, setFormFields] = useState<CustomerFormFields>(EMPTY_CUSTOMER_FORM);

  const customerList = useMemo(() => {
    return (customers as unknown as BackendCustomer[]) || [];
  }, [customers]);

  const hasApiData = customerList.length > 0;

  const filteredCustomers = useMemo(() => {
    return customerList.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !statusFilter || customer.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [customerList, searchTerm, statusFilter]);

  const filteredMockRows = useMemo(() => {
    return STATIC_CUSTOMER_ROWS.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.phone.includes(searchTerm);
      const matchesStatus =
        !statusFilter || row.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesTier = !tierFilter || row.tier.toLowerCase() === tierFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [searchTerm, statusFilter, tierFilter]);

  const handleOpenForm = (customer?: BackendCustomer | CustomerListRow) => {
    if (customer && "email" in customer) {
      setIsEditing(true);
      setSelectedCustomer(null);
      setFormFields(toCustomerForm(customer));
    } else if (customer && "contact" in customer) {
      setIsEditing(true);
      setSelectedCustomer(customer as BackendCustomer);
      const [firstName = "", ...rest] = customer.name.split(" ");
      setFormFields({
        firstName,
        familyName: rest.join(" "),
        username: customer.name.toLowerCase().replace(/\s+/g, ""),
        email: customer.contact.includes("@") ? customer.contact : "",
        password: "",
        phone: customer.contact.includes("@") ? "" : customer.contact,
      });
    } else {
      setIsEditing(false);
      setSelectedCustomer(null);
      setFormFields(EMPTY_CUSTOMER_FORM);
    }
    setFormOpen(true);
  };

  const handleOpenFormFromDetail = (detail: CustomerDetailView) => {
    const row = STATIC_CUSTOMER_ROWS.find((item) => item.name === detail.name);
    setIsEditing(true);
    setSelectedCustomer(null);
    setFormFields(row ? toCustomerForm(row) : {
      ...EMPTY_CUSTOMER_FORM,
      firstName: detail.name.split(" ")[0] ?? "",
      familyName: detail.name.split(" ").slice(1).join(" "),
      email: detail.email,
      phone: detail.phone,
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCustomer(null);
    setFormFields(EMPTY_CUSTOMER_FORM);
  };

  const handleViewDetail = (row: CustomerListRow) => {
    setDetailView(toCustomerDetail(row));
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) setDetailView(null);
  };

  const handleSubmit = async () => {
    if (
      !formFields.firstName.trim() ||
      !formFields.familyName.trim() ||
      !formFields.username.trim() ||
      !formFields.email.trim() ||
      !formFields.phone.trim() ||
      (!isEditing && !formFields.password.trim())
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: `${formFields.firstName.trim()} ${formFields.familyName.trim()}`.trim(),
      contact: formFields.email.trim() || formFields.phone.trim(),
      status: "ACTIVE",
    };

    setSubmitLoading(true);
    try {
      if (isEditing && selectedCustomer) {
        await customerApi.update(
          selectedCustomer.id,
          payload as unknown as Parameters<typeof customerApi.update>[1]
        );
        toast.success("Customer updated successfully");
      } else if (isEditing) {
        toast.success("Customer updated successfully");
      } else {
        await customerApi.create(
          payload as unknown as Parameters<typeof customerApi.create>[0]
        );
        toast.success("Customer created successfully");
      }
      handleCloseForm();
      refetch();
    } catch {
      toast.error("Failed to save customer");
    } finally {
      setSubmitLoading(false);
    }
  };

  const displayCount = hasApiData ? filteredCustomers.length : filteredMockRows.length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTierFilter("");
  };

  const apiPage = usePagination(filteredCustomers);
  const mockPage = usePagination(filteredMockRows);
  const activePage = hasApiData ? apiPage : mockPage;

  const handleExport = () =>
    downloadCsv("customers", filteredCustomers as never[], autoColumns(filteredCustomers as never[]));

  return (
    <PageShell>
      <PageHeader
        title="Customers List"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Customers" },
          { label: "Customers List" },
        ]}
        rightSlot={<AdminTopActions />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Total Customer" value={hasApiData ? String(customerList.length) : "2"} tone="gray" />
        <StatTile title="Active" value={hasApiData ? String(customerList.filter((c) => c.status === "ACTIVE").length) : "1"} tone="green" />
        <StatTile title="Ready" value="1" tone="gray" />
        <StatTile title="AVG Orders/Customer" value="10" tone="gray" />
      </div>

      <FilterPanel defaultCollapsed={false}>
        <TextField
          label="Customer Name"
          placeholder="Placeholder"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onValueChange={(e) => setStatusFilter(e)}
        >
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">InActive</SelectItem>
        </SelectField>
        <SelectField
          label="Tier"
          value={tierFilter}
          onValueChange={(e) => setTierFilter(e)}
        >
          <SelectItem value="silver">Silver</SelectItem>
          <SelectItem value="gold">Gold</SelectItem>
          <SelectItem value="bronze">Bronze</SelectItem>
        </SelectField>
        <FilterActions onClear={handleClearFilters} />
      </FilterPanel>

      <DataCard
        title="Customer Directory"
        meta={`Customer found: ${displayCount}`}
        actions={<TableActions onRegister={() => handleOpenForm()} onExport={handleExport} primaryLabel="Register" />}
      >
        <SimpleTable
          headers={["No", "Customer", "Contact", "Tier", "Joined", "Status", "Action"]}
        >
          {hasApiData
            ? apiPage.pageRows.map((customer, index) => (
                <Row key={customer.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <CustomerIdentity name={customer.name} />
                  </Cell>
                  <Cell>{customer.contact}</Cell>
                  <Cell>
                    <TierBadge tier="Silver" />
                  </Cell>
                  <Cell>{new Date(customer.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}</Cell>
                  <Cell>
                    <CustomerStatusCell status={getStatusLabel(customer.status)} />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => undefined}
                      onEdit={() => handleOpenForm(customer)}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))
            : mockPage.pageRows.map((row, index) => (
                <Row key={row.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <CustomerIdentity name={row.name} />
                  </Cell>
                  <Cell>
                    <CustomerContact email={row.email} phone={row.phone} />
                  </Cell>
                  <Cell>
                    <TierBadge tier={row.tier} />
                  </Cell>
                  <Cell>{row.joined}</Cell>
                  <Cell>
                    <CustomerStatusCell status={row.status} locked={row.locked} />
                  </Cell>
                  <Cell>
                    <RowActions
                      onView={() => handleViewDetail(row)}
                      onEdit={() => handleOpenForm(row)}
                      onDelete={() => undefined}
                    />
                  </Cell>
                </Row>
              ))}
        </SimpleTable>
        <PaginationFooter
          page={activePage.page}
          totalPages={activePage.totalPages}
          pageSize={activePage.pageSize}
          onPageChange={activePage.setPage}
          onPageSizeChange={activePage.setPageSize}
        />
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}
        title="Customer Register/Modify"
        onSubmit={handleSubmit}
        isLoading={submitLoading}
        submitLabel="Submit"
      >
        <ModalGrid>
          <FormInput
            label="First Name"
            placeholder="Placeholder"
            value={formFields.firstName}
            onChange={(e) =>
              setFormFields({ ...formFields, firstName: e.target.value })
            }
            required
          />
          <FormInput
            label="Family Name"
            placeholder="Placeholder"
            value={formFields.familyName}
            onChange={(e) =>
              setFormFields({ ...formFields, familyName: e.target.value })
            }
            required
          />
          <FormInput
            label="Username"
            placeholder="Placeholder"
            value={formFields.username}
            onChange={(e) =>
              setFormFields({ ...formFields, username: e.target.value })
            }
            required
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="Placeholder"
            value={formFields.email}
            onChange={(e) =>
              setFormFields({ ...formFields, email: e.target.value })
            }
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Placeholder"
            value={formFields.password}
            onChange={(e) =>
              setFormFields({ ...formFields, password: e.target.value })
            }
            required={!isEditing}
          />
          <FormInput
            label="Phone Number"
            placeholder="Placeholder"
            value={formFields.phone}
            onChange={(e) =>
              setFormFields({ ...formFields, phone: e.target.value })
            }
            required
          />
        </ModalGrid>
      </FormModal>

      <DetailModal
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        title="Customer Detail"
        onEdit={() => {
          const current = detailView;
          setDetailOpen(false);
          setDetailView(null);
          if (current) {
            handleOpenFormFromDetail(current);
          }
        }}
      >
        {detailView && (
          <div className="admin_modal_form_wrap">
            <DetailGrid>
              <DetailItem label="Customer Name">{detailView.name}</DetailItem>
              <DetailItem label="Gmail">{detailView.email}</DetailItem>
              <DetailItem label="Phone No">{detailView.phone}</DetailItem>
              <DetailItem label="Joined Date">{detailView.joined}</DetailItem>
              <DetailItem label="Tier">
                <TierBadge tier={detailView.tier} />
              </DetailItem>
              <DetailItem label="Status">
                <CustomerStatusCell
                  status={detailView.status}
                  locked={detailView.locked}
                />
              </DetailItem>
            </DetailGrid>
          </div>
        )}
      </DetailModal>
    </PageShell>
  );
}
