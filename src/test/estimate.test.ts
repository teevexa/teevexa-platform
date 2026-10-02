import { describe, it, expect } from "vitest";
import {
  computeEstimate,
  heuristicBrief,
  sanitizeBrief,
  formatPrice,
  PROTOTYPE_PACKAGE,
} from "../../supabase/functions/_shared/estimate";

const base = { kind: "webapp" as const, startingPoint: "scratch" as const, capabilities: [], integrations: [], timing: "normal" as const };

describe("computeEstimate", () => {
  it("prices the prototype package as a fixed price", () => {
    const e = computeEstimate({ ...base, kind: "prototype", startingPoint: "prototype", integrations: ["local"] });
    expect(e.mode).toBe("fixed");
    expect(e.low).toBe(e.high);
    expect(e.low).toBe(PROTOTYPE_PACKAGE.basePrice + 650);
  });

  it("falls back to a custom range when a prototype is too large for the fixed sprint", () => {
    const caps = ["auth", "payments", "admin", "realtime", "ai", "files"];
    const e = computeEstimate({ ...base, startingPoint: "prototype", capabilities: caps });
    expect(e.mode).toBe("range");
    expect(e.low).toBeLessThan(e.high);
  });

  it("scratch builds cost more than existing-product work", () => {
    const scratch = computeEstimate(base);
    const existing = computeEstimate({ ...base, startingPoint: "existing" });
    expect(scratch.low).toBeGreaterThan(existing.low);
  });

  it("rush adds 25% and shortens the schedule", () => {
    const normal = computeEstimate(base);
    const rush = computeEstimate({ ...base, timing: "rush" });
    expect(rush.low).toBeGreaterThan(normal.low * 1.2);
    expect(rush.weeksHigh).toBeLessThanOrEqual(normal.weeksHigh);
  });

  it("line items sum to the totals and ignore unknown ids", () => {
    const e = computeEstimate({ ...base, capabilities: ["auth", "nope"], integrations: ["local", "bogus"], timing: "rush" });
    expect(e.lineItems.reduce((s, l) => s + l.low, 0)).toBe(e.low);
    expect(e.lineItems.reduce((s, l) => s + l.high, 0)).toBe(e.high);
    expect(e.lineItems.some((l) => /nope|bogus/.test(l.label))).toBe(false);
  });

  it("weeks are ordered", () => {
    for (const kind of ["website", "webapp", "mobile", "ecommerce", "enterprise", "ai", "other"] as const) {
      const e = computeEstimate({ ...base, kind, capabilities: ["auth", "payments"], integrations: ["local"] });
      expect(e.weeksLow).toBeLessThan(e.weeksHigh);
      expect(formatPrice(e)).toMatch(/^\$/);
    }
  });
});

describe("heuristicBrief / sanitizeBrief", () => {
  it("detects an AI-built prototype and M-Pesa", () => {
    const b = heuristicBrief("I built a booking app in Lovable and need M-Pesa payments and a admin dashboard, ASAP");
    expect(b.startingPoint).toBe("prototype");
    expect(b.integrations).toContain("local");
    expect(b.capabilities).toContain("admin");
    expect(b.timing).toBe("rush");
  });

  it("never trusts unknown ids from AI output", () => {
    const b = sanitizeBrief({ kind: "hack" as never, capabilities: ["auth", "rm -rf"], integrations: ["x"] }, "an online store");
    expect(b.kind).toBe("ecommerce");
    expect(b.capabilities).toEqual(["auth"]);
    expect(b.integrations).toEqual([]);
  });
});

import {
  slotsForLocalDate, isBookableInstant, slotInstant, eatParts, zonedParts, isValidTimeZone,
  SLOT_TIMES, SLOT_DURATION_MINUTES,
} from "../../supabase/functions/_shared/slots";

describe("consultation slots (Nairobi-defined)", () => {
  const now = new Date("2026-09-21T00:00:00Z"); // Monday

  it("converts a Nairobi slot to the exact instant", () => {
    expect(slotInstant("2026-09-22", "09:00").toISOString()).toBe("2026-09-22T06:00:00.000Z");
    expect(eatParts(slotInstant("2026-09-22", "09:00"))).toMatchObject({ date: "2026-09-22", time: "09:00", weekday: 2 });
  });

  it("books 20-minute slots, three per busy hour, 09:00-18:00 with a 13:00-14:00 lunch break", () => {
    expect(SLOT_DURATION_MINUTES).toBe(20);
    expect(SLOT_TIMES.length).toBe(24); // 8 working hours a day x 3 slots/hour
    expect(SLOT_TIMES[0]).toBe("09:00");
    expect(SLOT_TIMES[SLOT_TIMES.length - 1]).toBe("17:40"); // last slot ends 18:00
    expect(SLOT_TIMES).not.toContain("13:00"); // lunch
    expect(SLOT_TIMES).not.toContain("13:40"); // lunch
    // Every slot has two more slots 20 and 40 minutes later within the same business hour.
    const sameHour = (t: string) => SLOT_TIMES.filter((x) => x.slice(0, 2) === t.slice(0, 2));
    expect(sameHour("09:00")).toEqual(["09:00", "09:20", "09:40"]);
    expect(sameHour("14:00")).toEqual(["14:00", "14:20", "14:40"]);
  });

  it("Nairobi visitor sees the same clock times", () => {
    const s = slotsForLocalDate("2026-09-22", "Africa/Nairobi", now);
    expect(s.map((x) => x.localTime)).toEqual(SLOT_TIMES);
  });

  it("Toronto visitor gets early-morning local times and never a slot outside Nairobi hours", () => {
    const s = slotsForLocalDate("2026-09-22", "America/Toronto", now); // EDT = UTC-4
    expect(s[0].localTime).toBe("02:00"); // 09:00 EAT
    s.forEach((x) => expect(SLOT_TIMES).toContain(x.eatTime));
    s.forEach((x) => expect(zonedParts(x.start, "America/Toronto").date).toBe("2026-09-22"));
  });

  it("a Sunday evening in Los Angeles maps to Monday slots in Nairobi", () => {
    const s = slotsForLocalDate("2026-09-27", "America/Los_Angeles", now); // Sunday
    expect(s.length).toBeGreaterThan(0);
    s.forEach((x) => expect(x.eatDate).toBe("2026-09-28"));
  });

  it("accepts Saturday, rejects Sunday, off-grid times, the past and far future", () => {
    expect(isBookableInstant(slotInstant("2026-09-26", "10:00"), now)).toBe(true); // Saturday — now a working day
    expect(isBookableInstant(slotInstant("2026-09-27", "10:00"), now)).toBe(false); // Sunday
    expect(isBookableInstant(slotInstant("2026-09-22", "13:00"), now)).toBe(false); // lunch (13:00-14:00)
    expect(isBookableInstant(slotInstant("2026-09-22", "12:00"), now)).toBe(true); // 12:00 is a working slot now
    expect(isBookableInstant(slotInstant("2026-09-21", "09:00"), new Date("2026-09-21T05:00:00Z"))).toBe(false); // <4h lead
    expect(isBookableInstant(slotInstant("2027-03-01", "10:00"), now)).toBe(false);
    expect(isBookableInstant(slotInstant("2026-09-22", "10:00"), now)).toBe(true);
  });

  it("validates time zones", () => {
    expect(isValidTimeZone("America/Toronto")).toBe(true);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
  });
});


describe("integrations are global, not Kenya-only", () => {
  it("recognises Stripe, PayPal, Pesapal and Razorpay", () => {
    const b = heuristicBrief("We sell worldwide: Stripe and PayPal for cards, Pesapal for East Africa, Razorpay for India");
    expect(b.integrations).toEqual(expect.arrayContaining(["cards", "local"]));
  });
});

describe("kind detection", () => {
  it("treats a generic app description as a web app, not other", () => {
    expect(heuristicBrief("Booking app for clinics with Stripe").kind).toBe("webapp");
    expect(heuristicBrief("an online store").kind).toBe("ecommerce");
    expect(heuristicBrief("a mobile app for delivery drivers").kind).toBe("mobile");
  });
});
