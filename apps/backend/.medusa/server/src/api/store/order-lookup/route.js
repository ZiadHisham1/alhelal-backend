"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const query = (req.query.q || "").trim();
    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }
    const orderService = req.scope.resolve(utils_1.Modules.ORDER);
    // ─────────────────────────────────────────────
    // Case 1: order ID (starts with "ord_")
    // ─────────────────────────────────────────────
    if (query.startsWith("ord_")) {
        try {
            const order = await orderService.retrieveOrder(query);
            return res.json({ order: { id: order.id } });
        }
        catch {
            return res.status(404).json({ error: "Order not found" });
        }
    }
    // ─────────────────────────────────────────────
    // Case 2: numeric — try display_id, then phone
    // ─────────────────────────────────────────────
    if (/^\d+$/.test(query)) {
        // 2a: display_id — filter in memory to avoid typed filter restrictions
        const match = await findOrderByDisplayId(orderService, query);
        if (match)
            return res.json({ order: { id: match.id } });
        // 2b: phone (if ≥ 10 digits)
        if (query.length >= 10) {
            const phoneMatch = await findOrderByPhone(orderService, query);
            if (phoneMatch)
                return res.json({ order: { id: phoneMatch.id } });
        }
        return res.status(404).json({ error: "Order not found" });
    }
    // ─────────────────────────────────────────────
    // Case 3: phone with non-digit chars (e.g. +20...)
    // ─────────────────────────────────────────────
    const phoneMatch = await findOrderByPhone(orderService, query);
    if (phoneMatch)
        return res.json({ order: { id: phoneMatch.id } });
    return res.status(404).json({ error: "Order not found" });
}
/**
 * Find an order by display_id.
 * Fetches recent orders and filters in memory.
 */
async function findOrderByDisplayId(orderService, displayId) {
    try {
        const [orders] = await orderService.listAndCountOrders({}, {
            take: 500,
            order: { created_at: "DESC" },
        });
        return (orders.find((o) => String(o.display_id) === String(displayId)) ?? null);
    }
    catch (e) {
        console.error("[lookup] display_id lookup failed:", e);
        return null;
    }
}
/**
 * Find the most recent order matching a phone number.
 * Handles Egyptian formats: 01012345678, +201012345678, 201012345678, 1012345678
 */
async function findOrderByPhone(orderService, rawPhone) {
    const digits = rawPhone.replace(/\D/g, "");
    const variants = new Set([digits]);
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
    const variantArray = Array.from(variants).map((v) => v.replace(/\D/g, ""));
    try {
        const [orders] = await orderService.listAndCountOrders({}, {
            take: 500,
            order: { created_at: "DESC" },
        });
        const matches = orders.filter((o) => {
            const phone = (o.shipping_address?.phone ?? "").replace(/\D/g, "");
            if (!phone)
                return false;
            return variantArray.some((v) => phone === v);
        });
        return matches[0] ?? null;
    }
    catch (e) {
        console.error("[lookup] phone lookup failed:", e);
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL29yZGVyLWxvb2t1cC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLGtCQTRDQztBQTlDRCxxREFBb0Q7QUFFN0MsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELE1BQU0sS0FBSyxHQUFHLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFZLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1gsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV0RCxnREFBZ0Q7SUFDaEQsd0NBQXdDO0lBQ3hDLGdEQUFnRDtJQUNoRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUM7WUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEQsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNQLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7SUFDSCxD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