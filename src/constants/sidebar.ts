import {
  Archive,
  BadgePercent,
  BarChart3,
  CircleDollarSign,
  Coffee,
  Home,
  Package,
  ClipboardList,
  Settings,
  Star,
  Tags,
  UserCog,
  UsersRound,
} from "lucide-react";

const navigationSections = [
  {
    title: "",
    dividerBefore: false,
    items: [{ name: "Home", href: "/", icon: Home, label: "nav_home" }],
  },
  {
    title: "Operations",
    dividerBefore: true,
    items: [
      {
        name: "POS",
        href: "/pos",
        icon: CircleDollarSign,
        label: "nav_pos",
      },
      {
        name: "Orders",
        href: "/orders",
        icon: ClipboardList,
        label: "nav_orders",
      },
      { name: "Barista", href: "/barista-queue", icon: Coffee, label: "nav_barista" },
    ],
  },
  {
    title: "Catalog",
    dividerBefore: false,
    items: [
      {
        name: "Products",
        href: "/products",
        icon: Package,
        label: "nav_products",
      },
      {
        name: "Categories",
        href: "/categories",
        icon: Tags,
        label: "nav_categories",
      },
      {
        name: "Inventory",
        href: "/inventory",
        icon: Archive,
        label: "nav_inventory",
      },
    ],
  },
  {
    title: "Customer & Rating",
    dividerBefore: false,
    items: [
      {
        name: "Customers",
        href: "/customers",
        icon: UsersRound,
        label: "nav_customers",
      },
      {
        name: "Promotion",
        href: "/promotions",
        icon: BadgePercent,
        label: "nav_promotion",
      },
      // { name: "Ratings", href: "/ratings", icon: Star, label: "nav_ratings" },
    ],
  },
  {
    title: "Analytics & Admin",
    dividerBefore: true,
    items: [
      { name: "Report", href: "/reports", icon: BarChart3, label: "nav_report" },
      {
        name: "Staff",
        href: "/staff",
        icon: UserCog,
        label: "nav_staff",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        label: "nav_settings",
      },
    ],
  },
];

const navigation = navigationSections.flatMap((section) => section.items);

export { navigation, navigationSections };
