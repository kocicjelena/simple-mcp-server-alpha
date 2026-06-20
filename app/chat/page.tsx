import Link from "next/link";
import McpServerShowcaseForm from "@/app/components/forms/McpServerShowcaseForm";

export default function McpServerPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>
        Simple MCP Server
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        A local App Router MCP endpoint with small built-in tools.
      </p>
      <McpServerShowcaseForm />
      <p style={{ marginTop: "1.25rem" }}>
        <Link href="/" style={{ color: "#a78bfa" }}>
          Back
        </Link>
      </p>
    </div>
  );
}
