"use client";

import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/common/PageShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AdminTopActions,
  Cell,
  DataCard,
  FilterPanel,
  FormInput,
  FormModal,
  FormSelect,
  ModalGrid,
  PaginationFooter,
  Row,
  RowActions,
  SimpleTable,
  StatTile,
  StatusBadge,
  TableActions,
  TextField,
} from "@/components/common/AdminKit";
import { useCustomers } from "@/hooks/useAdmin";
import { adminService } from "@/features/dashboard/api/dashboardApi";
import toast from "react-hot-toast";

interface BackendCustomer {
  id: number;
  name: string;
  contact: string;
  status: string;
  createdAt: string;
}

export default function Customers() {
  const { customers, isLoading, refetch } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<BackendCustomer | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    status: "ACTIVE",
  });

  // Fetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Safe cast
  const customerList = useMemo(() => {
    return (customers as unknown as BackendCustomer[]) || [];
  }, [customers]);

  // Filter
  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const contactMatch = c.contact.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || contactMatch;
    });
  }, [customerList, searchTerm]);

  // Summary counts
  const totalCount = customerList.length;
  const activeCount = customerList.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = totalCount - activeCount;

  const handleOpenForm = (customer?: BackendCustomer) => {
    if (customer) {
      setIsEditing(true);
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        contact: customer.contact,
        status: customer.status,
      });
    } else {
      setIsEditing(false);
      setSelectedCustomer(null);
      setFormData({
        name: "",
        contact: "",
        status: "ACTIVE",
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedCustomer(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.contact.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitLoading(true);
    try {
      if (isEditing && selectedCustomer) {
        // Update endpoint
        await adminService.customers.update(selectedCustomer.id, formData as unknown as Parameters<typeof adminService.customers.update>[1]);
        toast.success("Customer updated successfully");
      } else {
        // Create endpoint
        await adminService.customers.create(formData as unknown as Parameters<typeof adminService.customers.create>[0]);
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile title="Total Customers" value={String(totalCount)} hint="Registered accounts" />
        <StatTile title="Active Customers" value={String(activeCount)} tone="green" hint="Active status" />
        <StatTile title="Inactive Customers" value={String(inactiveCount)} tone="gray" hint="Inactive status" />
      </div>

      <FilterPanel>
        {/* <TextField
          label="Search Customer"
          placeholder="Name or contact info..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        /> */}
      </FilterPanel>

      <DataCard
        title="Customer Directory"
        meta={`Customer found: ${filteredCustomers.length}`}
        actions={<TableActions onRegister={() => handleOpenForm()} primaryLabel="Register Customer" />}
      >
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No customers found</div>
        ) : (
          <>
            <SimpleTable
              headers={["No", "Customer Name", "Contact Information", "Joined Date", "Status", "Action"]}
            >
              {filteredCustomers.map((customer, index) => (
                <Row key={customer.id} striped={index % 2 === 1}>
                  <Cell>{index + 1}</Cell>
                  <Cell>
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-black font-semibold text-[#befe35]">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-900">{customer.name}</span>
                    </div>
                  </Cell>
                  <Cell>{customer.contact}</Cell>
                  <Cell>{new Date(customer.createdAt).toLocaleDateString()}</Cell>
                  <Cell>
                    <StatusBadge
                      label={customer.status}
                      variant={customer.status === "ACTIVE" ? "success" : "secondary"}
                    />
                  </Cell>
                  <Cell>
                    <RowActions onEdit={() => handleOpenForm(customer)} />
                  </Cell>
                </Row>
              ))}
            </SimpleTable>
            <PaginationFooter />
          </>
        )}
      </DataCard>

      <FormModal
        open={formOpen}
        onOpenChange={handleCloseForm}
        title={isEditing ? "Modify Customer Profile" : "Register New Customer"}
        onSubmit={handleSubmit}
        isLoading={submitLoading}
        submitLabel={isEditing ? "Update Customer" : "Create Customer"}
      >
        <ModalGrid>
          <FormInput
            label="Customer Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="Contact Detail *"
            placeholder="Email or Phone Number"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </FormSelect>
        </ModalGrid>
      </FormModal>
    </PageShell>
  );
}
