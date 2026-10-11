import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = ((req.query.q as string) || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const orderService = req.scope.resolve(Modules.ORDER);

  // ─────────────────────────────────────────────
  // Case 1: order ID (starts with "ord_")
  // ─────────────────────────────────────────────
  if (query.startsWith("ord_")) {
    try {
      const order = await orderService.retrieveOrder(query);
      return res.json({ order: { id: order.id } });
    } catch {
      return res.status(404).json({ error: "Order not found" });
    }
  }

  // ─────────────────────────────────────────────
  // Case 2: numeric — try display_id, then phone
  // ─────────────────────────────────────────────
  if (/^\d+$/.test(query)) {
    // 2a: display_id — filter in memory to avoid typed filter restrictions
    const match = await findOrderByDisplayId(orderService, query);
    if (match) return res.json({ order: { id: match.id } });

    // 2b: phone (if ≥ 10 digits)
    if (query.length >= 10) {
      const phoneMatch = await findOrderByPhone(orderService, query);
      if (phoneMatch) return res.json({ order: { id: phoneMatch.id } });
    }

    return res.status(404).json({ error: "Order not found" });
  }

  // ─────────────────────────────────────────────
  // Case 3: phone with non-digit chars (e.g. +20...)
  // ─────────────────────────────────────────────
  const phoneMatch = await findOrderByPhone(orderService, query);
  if (phoneMatch) return res.json({ order: { id: phoneMatch.id } });

  return res.status(404).json({ error: "Order not found" });
}

/**
 * Find an order by display_id.
 * Fetches recent orders and filters in memory.
 */
async function findOrderByDisplayId(orderService: any, displayId: string) {
  try {
    const [orders] = await orderService.listAndCountOrders(
      {},
      {
        take: 500,
        order: { created_at: "DESC" },
      }
    );

    return (
      orders.find(
        (o: any) => String(o.display_id) === String(displayId)
      ) ?? null
    );
  } catch (e) {
    console.error("[lookup] display_id lookup failed:", e);
    return null;
  }
}

/**
 * Find the most recent order matching a phone number.
 * Handles Egyptian formats: 01012345678, +201012345678, 201012345678, 1012345678
 */
async function findOrderByPhone(orderService: any, rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "");

  const variants = new Set<string>([digits]);
  if (digits.startsWith("0")) {
    variants.add("+20" + digits.slice(1));
    variants.add("20" + digits.slice(1));
    variants.add(digits.slice(1));
  }
  if (digits.startsWith("20")) {
    variants.add("0" + digits.slice(2));
    variants.add(digits.slice(2));
  }
  if (digits.startsWith("1") && digits.length === 10) {
    variants.add("0" + digits);
    variants.add("+20" + digits);
  }

  const variantArray = Array.from(variants).map((v) =>
    v.replace(/\D/g, "")
  );

  try {
    const [orders] = await orderService.listAndCountOrders(
      {},
      {
        take: 500,
        order: { created_at: "DESC" },
      }
    );

    const matches = orders.filter((o: any) => {
      const phone = (o.shipping_address?.phone ?? "").replace(/\D/g, "");
      if (!phone) return false;
      return variantArray.some((v) => phone === v);
    });

    return matches[0] ?? null;
  } catch (e) {
    console.error("[lookup] phone lookup failed:", e);
    return null;
  }
}