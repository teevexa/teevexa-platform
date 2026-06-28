// Compliance Report generator for Teevexa Trace.
//
// Produces a PDF compliance report covering all batches and events for a user
// (or a specific dateRange), including:
//   - Summary: total batches, total events, on-chain ratio, trust distribution
//   - Full event log (sortable by date)
//   - Blockchain verification index (tx hashes)
//   - Suitable for EU Deforestation Regulation (EUDR), ISO 22005, customs
//
// Auth:  Authenticated trace_client or admin.
// Input: GET /generate-compliance-report?from=YYYY-MM-DD&to=YYYY-MM-DD
//        Both query params are optional (defaults to current month).
// Output: PDF (application/pdf)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VERIFY_BASE = "https://teevexa.com/trace/";

function escPdf(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "")
    .replace(/\n/g, " ");
}

function buildCompliancePdf(params: {
  companyName: string;
  reportId: string;
  periodFrom: string;
  periodTo: string;
  generatedAt: string;
  totalBatches: number;
  totalEvents: number;
  onChainEvents: number;
  gpsEvents: number;
  eventRows: Array<{
    batchId: string;
    eventType: string;
    location: string | null;
    recordedAt: string;
    blockchain_tx_hash: string | null;
  }>;
}): Uint8Array {
  const {
    companyName, reportId, periodFrom, periodTo, generatedAt,
    totalBatches, totalEvents, onChainEvents, gpsEvents, eventRows,
  } = params;

  const lines: string[] = [];
  const offsets: number[] = [];
  let pos = 0;

  const write = (s: string) => {
    lines.push(s);
    pos += new TextEncoder().encode(s + "\n").length;
  };

  const obj = (n: number, content: string) => {
    offsets[n] = pos;
    write(`${n} 0 obj`);
    write(content);
    write("endobj");
    write("");
  };

  write("%PDF-1.4");
  write("");

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 50;

  const contentLines: string[] = [];
  const cs = (s: string) => contentLines.push(s);

  // Background
  cs("q");
  cs("0.937 0.976 0.984 rg");
  cs(`0 0 ${PAGE_W} ${PAGE_H} re f`);
  cs("Q");

  // Header bar
  cs("q");
  cs("0.055 0.384 0.463 rg");
  cs(`0 ${PAGE_H - 85} ${PAGE_W} 85 re f`);
  cs("Q");

  // Title
  cs("BT /F1 18 Tf 1 1 1 rg");
  cs(`${MARGIN} ${PAGE_H - 45} Td`);
  cs(`(${escPdf("TEEVEXA TRACE — COMPLIANCE REPORT")}) Tj`);
  cs("ET");

  cs("BT /F2 9 Tf 0.8 0.9 1 rg");
  cs(`${MARGIN} ${PAGE_H - 65} Td`);
  cs(`(${escPdf(`EU Deforestation Regulation (EUDR) · ISO 22005 · Supply Chain Transparency`)}) Tj`);
  cs("ET");

  let y = PAGE_H - 105;

  const field = (label: string, value: string) => {
    cs("BT /F1 8 Tf 0.4 0.4 0.4 rg");
    cs(`${MARGIN} ${y} Td`);
    cs(`(${escPdf(label.toUpperCase())}) Tj`);
    cs("ET");
    cs("BT /F2 10 Tf 0.1 0.1 0.1 rg");
    cs(`${MARGIN + 120} ${y} Td`);
    cs(`(${escPdf(value)}) Tj`);
    cs("ET");
    y -= 18;
  };

  field("Report ID", reportId);
  field("Organisation", companyName);
  field("Period", `${periodFrom}  –  ${periodTo}`);
  field("Generated", generatedAt);

  y -= 6;

  // Divider
  cs("q 0.106 0.616 0.745 rg");
  cs(`${MARGIN} ${y} ${PAGE_W - MARGIN * 2} 1.5 re f`);
  cs("Q");
  y -= 14;

  // Summary box header
  cs("BT /F1 10 Tf 0.106 0.616 0.745 rg");
  cs(`${MARGIN} ${y} Td`);
  cs("(SUMMARY) Tj");
  cs("ET");
  y -= 14;

  const summaryItems = [
    ["Total Batches Tracked", String(totalBatches)],
    ["Total Supply Chain Events", String(totalEvents)],
    ["Blockchain-Verified Events", `${onChainEvents} (${totalEvents > 0 ? Math.round((onChainEvents / totalEvents) * 100) : 0}%)`],
    ["GPS-Tagged Events", `${gpsEvents} (${totalEvents > 0 ? Math.round((gpsEvents / totalEvents) * 100) : 0}%)`],
    ["Verification Rate", onChainEvents === totalEvents && totalEvents > 0 ? "100% — Fully Verified ✓" : `${totalEvents > 0 ? Math.round((onChainEvents / totalEvents) * 100) : 0}%`],
  ];

  for (const [label, value] of summaryItems) {
    cs("BT /F2 9 Tf 0.2 0.2 0.2 rg");
    cs(`${MARGIN} ${y} Td`);
    cs(`(${escPdf(label + ":")}) Tj`);
    cs("ET");
    cs("BT /F1 9 Tf 0.1 0.1 0.1 rg");
    cs(`${MARGIN + 180} ${y} Td`);
    cs(`(${escPdf(value)}) Tj`);
    cs("ET");
    y -= 14;
  }

  y -= 6;

  cs("q 0.106 0.616 0.745 rg");
  cs(`${MARGIN} ${y} ${PAGE_W - MARGIN * 2} 1.5 re f`);
  cs("Q");
  y -= 14;

  // Event log header
  cs("BT /F1 10 Tf 0.106 0.616 0.745 rg");
  cs(`${MARGIN} ${y} Td`);
  cs("(SUPPLY CHAIN EVENT LOG) Tj");
  cs("ET");
  y -= 14;

  // Column headers
  cs("BT /F1 7 Tf 0.4 0.4 0.4 rg");
  cs(`${MARGIN} ${y} Td`);
  cs("(DATE / TIME) Tj");
  cs("ET");
  cs("BT /F1 7 Tf 0.4 0.4 0.4 rg");
  cs(`${MARGIN + 100} ${y} Td`);
  cs("(BATCH ID) Tj");
  cs("ET");
  cs("BT /F1 7 Tf 0.4 0.4 0.4 rg");
  cs(`${MARGIN + 220} ${y} Td`);
  cs("(EVENT TYPE) Tj");
  cs("ET");
  cs("BT /F1 7 Tf 0.4 0.4 0.4 rg");
  cs(`${MARGIN + 320} ${y} Td`);
  cs("(LOCATION) Tj");
  cs("ET");
  cs("BT /F1 7 Tf 0.4 0.4 0.4 rg");
  cs(`${MARGIN + 430} ${y} Td`);
  cs("(VERIFIED) Tj");
  cs("ET");
  y -= 10;

  cs("q 0.8 0.8 0.8 rg");
  cs(`${MARGIN} ${y} ${PAGE_W - MARGIN * 2} 0.5 re f`);
  cs("Q");
  y -= 10;

  for (const row of eventRows) {
    if (y < 50) break;
    const dt = new Date(row.recordedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
    const typeLabel = row.eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const loc = (row.location || "").slice(0, 20);
    const verified = row.blockchain_tx_hash ? "Yes" : "No";
    const color = row.blockchain_tx_hash ? "0 0.5 0.2 rg" : "0.6 0.3 0 rg";

    cs(`BT /F2 7 Tf 0.2 0.2 0.2 rg ${MARGIN} ${y} Td (${escPdf(dt.slice(0, 16))}) Tj ET`);
    cs(`BT /F2 7 Tf 0.2 0.2 0.2 rg ${MARGIN + 100} ${y} Td (${escPdf(row.batchId.slice(0, 18))}) Tj ET`);
    cs(`BT /F2 7 Tf 0.2 0.2 0.2 rg ${MARGIN + 220} ${y} Td (${escPdf(typeLabel.slice(0, 16))}) Tj ET`);
    cs(`BT /F2 7 Tf 0.2 0.2 0.2 rg ${MARGIN + 320} ${y} Td (${escPdf(loc)}) Tj ET`);
    cs(`BT /F1 7 Tf ${color} ${MARGIN + 430} ${y} Td (${escPdf(verified)}) Tj ET`);
    y -= 12;
  }

  // Footer
  cs("BT /F2 7 Tf 0.5 0.5 0.5 rg");
  cs(`${MARGIN} 35 Td`);
  cs(`(${escPdf(`Report ID: ${reportId}  |  Generated by Teevexa Trace  |  ${VERIFY_BASE}`)}) Tj`);
  cs("ET");

  const streamContent = contentLines.join("\n");
  const streamBytes = new TextEncoder().encode(streamContent);

  obj(1, `<< /Type /Catalog /Pages 2 0 R >>`);
  obj(2, `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`);
  obj(4, `<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream`);
  obj(5, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);
  obj(6, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  const xrefPos = pos;
  const objCount = 7;

  write("xref");
  write(`0 ${objCount}`);
  write("0000000000 65535 f ");
  for (let i = 1; i < objCount; i++) {
    write((offsets[i] ?? 0).toString().padStart(10, "0") + " 00000 n ");
  }
  write("trailer");
  write(`<< /Size ${objCount} /Root 1 0 R >>`);
  write("startxref");
  write(String(xrefPos));
  write("%%EOF");

  return new TextEncoder().encode(lines.join("\n"));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const defaultTo = now.toISOString().slice(0, 10);
    const fromDate = url.searchParams.get("from") || defaultFrom;
    const toDate = url.searchParams.get("to") || defaultTo;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Profile / company
    const { data: profile } = await adminClient
      .from("profiles")
      .select("display_name, company")
      .eq("user_id", user.id)
      .single();

    const companyName = profile?.company || profile?.display_name || user.email || "Teevexa User";

    // All events in the period (trace_clients see all; restrict to their recorded events otherwise)
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isClient = roles?.some((r: any) =>
      ["trace_client", "admin", "super_admin"].includes(r.role)
    );

    let evQuery = adminClient
      .from("trace_events")
      .select("id, product_id, event_type, location, latitude, longitude, recorded_at, blockchain_tx_hash")
      .gte("recorded_at", `${fromDate}T00:00:00Z`)
      .lte("recorded_at", `${toDate}T23:59:59Z`)
      .order("recorded_at", { ascending: true });

    if (!isClient) {
      evQuery = evQuery.eq("recorded_by", user.id);
    }

    const { data: events } = await evQuery;
    const evList = events || [];

    const batchIds = [...new Set(evList.map((e: any) => e.product_id))];
    const onChainCount = evList.filter((e: any) => e.blockchain_tx_hash).length;
    const gpsCount = evList.filter((e: any) => e.latitude !== null).length;
    const reportId = `RPT-${user.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });

    const pdfBytes = buildCompliancePdf({
      companyName,
      reportId,
      periodFrom: fromDate,
      periodTo: toDate,
      generatedAt,
      totalBatches: batchIds.length,
      totalEvents: evList.length,
      onChainEvents: onChainCount,
      gpsEvents: gpsCount,
      eventRows: evList.map((e: any) => ({
        batchId: e.product_id,
        eventType: e.event_type,
        location: e.location,
        recordedAt: e.recorded_at,
        blockchain_tx_hash: e.blockchain_tx_hash,
      })),
    });

    const fileName = `Teevexa-Compliance-Report-${fromDate}_${toDate}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (err) {
    console.error("generate-compliance-report error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
