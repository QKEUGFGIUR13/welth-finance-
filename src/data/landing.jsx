import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

export const featuresData = [
  {
    icon: <BarChart3 className="h-7 w-7" strokeWidth={1.75} />,
    title: "Advanced analytics",
    description:
      "See spending patterns clearly with AI-assisted breakdowns that highlight what actually matters.",
  },
  {
    icon: <Receipt className="h-7 w-7" strokeWidth={1.75} />,
    title: "Smart receipt scanner",
    description:
      "Capture merchants, amounts, and categories from a photo — skip the manual entry grind.",
  },
  {
    icon: <PieChart className="h-7 w-7" strokeWidth={1.75} />,
    title: "Budget planning",
    description:
      "Set monthly limits and stay aware before overspending becomes a habit.",
  },
  {
    icon: <CreditCard className="h-7 w-7" strokeWidth={1.75} />,
    title: "Multi-account support",
    description:
      "Checking, savings, and more — managed from one calm, unified workspace.",
  },
  {
    icon: <Globe className="h-7 w-7" strokeWidth={1.75} />,
    title: "Multi-currency ready",
    description:
      "Keep international activity organized without losing track of the bigger picture.",
  },
  {
    icon: <Zap className="h-7 w-7" strokeWidth={1.75} />,
    title: "Automated insights",
    description:
      "Recurring charges, budget alerts, and monthly reports that arrive when you need them.",
  },
];

export const howItWorksData = [
  {
    title: "Create your account",
    description:
      "Sign up securely and sync your first Welth profile in under a minute.",
  },
  {
    title: "Track your spending",
    description:
      "Log transactions or scan receipts — categories stay tidy without busywork.",
  },
  {
    title: "Get insights",
    description:
      "Review budgets and AI summaries that help you adjust with confidence.",
  },
];

export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "Welth changed how I run the books. The insights surfaced costs I had been ignoring for months.",
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "Receipt scanning alone saves me hours every month. I stay focused on client work instead of spreadsheets.",
  },
  {
    name: "Emily Rodriguez",
    role: "Financial Advisor",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "I recommend Welth to clients who want serious visibility without enterprise complexity.",
  },
];
