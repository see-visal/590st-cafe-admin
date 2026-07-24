export type CustomerListRow = {
  id: string;
  firstName: string;
  familyName: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  tier: "Silver" | "Gold" | "Bronze";
  joined: string;
  status: "Active" | "InActive";
  locked?: boolean;
};

export type CustomerDetailView = {
  name: string;
  email: string;
  phone: string;
  tier: string;
  joined: string;
  status: string;
  locked?: boolean;
};

export type CustomerFormFields = {
  firstName: string;
  familyName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
};

export const EMPTY_CUSTOMER_FORM: CustomerFormFields = {
  firstName: "",
  familyName: "",
  username: "",
  email: "",
  password: "",
  phone: "",
};

export const STATIC_CUSTOMER_ROWS: CustomerListRow[] = [
  {
    id: "1",
    firstName: "Visal",
    familyName: "Soeurn",
    name: "Visal Soeurn",
    username: "visalsoeurn",
    email: "visal.soeurn@590stcafe.com",
    phone: "+855 12 345 678",
    tier: "Silver",
    joined: "10-Jan-2025",
    status: "Active",
    locked: false,
  },
  {
    id: "2",
    firstName: "Ream",
    familyName: "Chan",
    name: "Ream Chan",
    username: "reamchan",
    email: "reamchan@gmail.com",
    phone: "077777111",
    tier: "Silver",
    joined: "11 Apr, 2026",
    status: "InActive",
    locked: true,
  },
];

export function getCustomerById(id: string) {
  return STATIC_CUSTOMER_ROWS.find((row) => row.id === id);
}

export function toCustomerDetail(row: CustomerListRow): CustomerDetailView {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    tier: row.tier,
    joined: row.joined,
    status: row.status,
    locked: row.locked,
  };
}

export function toCustomerForm(row: CustomerListRow): CustomerFormFields {
  return {
    firstName: row.firstName,
    familyName: row.familyName,
    username: row.username,
    email: row.email,
    password: "",
    phone: row.phone,
  };
}
