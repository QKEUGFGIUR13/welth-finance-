import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Built without JSX so the server can import this under plain Node (and any
// serverless bundler), not just tsx.
const h = React.createElement;

// Dummy data for preview
export const PREVIEW_DATA = {
  monthlyReport: {
    userName: "John Doe",
    type: "monthly-report",
    data: {
      month: "December",
      stats: {
        totalIncome: 5000,
        totalExpenses: 3500,
        byCategory: {
          housing: 1500,
          groceries: 600,
          transportation: 400,
          entertainment: 300,
          utilities: 700,
        },
      },
      insights: [
        "Your housing expenses are 43% of your total spending - consider reviewing your housing costs.",
        "Great job keeping entertainment expenses under control this month!",
        "Setting up automatic savings could help you save 20% more of your income.",
      ],
    },
  },
  budgetAlert: {
    userName: "John Doe",
    type: "budget-alert",
    data: {
      percentageUsed: 85,
      budgetAmount: 4000,
      totalExpenses: 3400,
    },
  },
};

function stat(label, value) {
  return h(
    "div",
    { style: styles.stat },
    h(Text, { style: styles.text }, label),
    h(Text, { style: styles.heading }, value)
  );
}

function shell(previewText, title, children) {
  return h(
    Html,
    null,
    h(Head, null),
    h(Preview, null, previewText),
    h(
      Body,
      { style: styles.body },
      h(
        Container,
        { style: styles.container },
        h(Heading, { style: styles.title }, title),
        ...children
      )
    )
  );
}

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}) {
  if (type === "monthly-report") {
    return shell("Your Monthly Financial Report", "Monthly Financial Report", [
      h(Text, { style: styles.text }, "Hello ", userName, ","),
      h(
        Text,
        { style: styles.text },
        "Here\u2019s your financial summary for ",
        data?.month,
        ":"
      ),
      h(
        Section,
        { style: styles.statsContainer },
        stat("Total Income", `$${data?.stats.totalIncome}`),
        stat("Total Expenses", `$${data?.stats.totalExpenses}`),
        stat("Net", `$${data?.stats.totalIncome - data?.stats.totalExpenses}`)
      ),
      data?.stats?.byCategory
        ? h(
            Section,
            { style: styles.section },
            h(Heading, { style: styles.heading }, "Expenses by Category"),
            ...Object.entries(data.stats.byCategory).map(([category, amount]) =>
              h(
                "div",
                { key: category, style: styles.row },
                h(Text, { style: styles.text }, category),
                h(Text, { style: styles.text }, `$${amount}`)
              )
            )
          )
        : null,
      data?.insights
        ? h(
            Section,
            { style: styles.section },
            h(Heading, { style: styles.heading }, "Welth Insights"),
            ...data.insights.map((insight, index) =>
              h(Text, { key: index, style: styles.text }, "\u2022 ", insight)
            )
          )
        : null,
      h(
        Text,
        { style: styles.footer },
        "Thank you for using Welth. Keep tracking your finances for better financial health!"
      ),
    ]);
  }

  if (type === "budget-alert") {
    return shell("Budget Alert", "Budget Alert", [
      h(Text, { style: styles.text }, "Hello ", userName, ","),
      h(
        Text,
        { style: styles.text },
        "You\u2019ve used ",
        data?.percentageUsed.toFixed(1),
        "% of your monthly budget."
      ),
      h(
        Section,
        { style: styles.statsContainer },
        stat("Budget Amount", `$${data?.budgetAmount}`),
        stat("Spent So Far", `$${data?.totalExpenses}`),
        stat("Remaining", `$${data?.budgetAmount - data?.totalExpenses}`)
      ),
    ]);
  }
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};
