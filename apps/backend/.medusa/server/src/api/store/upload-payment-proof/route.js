"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const telegram_1 = require("../../../lib/telegram");
async function POST(req, res) {
    const logger = req.scope.resolve("logger");
    try {
        // Medusa parses multipart automatically when Content-Type is multipart/form-data
        const files = req.files;
        const file = files?.proof?.[0];
        if (!file) {
            return res.status(400).json({ error: "No file uploaded under field 'proof'" });
        }
        const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
        if (!ALLOWED.includes(file.mimetype)) {
            return res.status(400).json({ error: "Only JPEG, PNG, or WebP allowed" });
        }
        if (file.buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ error: "Max file size is 5MB" });
        }
        const body = req.body;
        const orderId = body?.order_id ?? "unknown";
        const customerName = body?.customer_name ?? "Guest";
        const email = body?.email ?? "";
        const amount = body?.amount ?? "?";
        const currency = body?.currency ?? "EGP";
        const caption = `💳 *New Payment Proof*\n` +
            `🧾 Order: #${orderId}\n` +
            `👤 ${customerName}\n` +
            (email ? `📧 ${email}\n` : "") +
            `💰 ${amount} ${currency}`;
        const result = await (0, telegram_1.sendTelegramPhoto)({
            buffer: file.buffer,
            filename: file.originalname || "proof.jpg",
            mimetype: file.mimetype,
        }, caption);
        logger.info(`✅ Payment proof sent to Telegram. file_id=${result.file_id}`);
        // If you have an order/cart module, attach file_id to its metadata:
        // const orderModule = req.scope.resolve("order")
        // await orderModule.updateOrders(orderId, { metadata: { payment_proof_file_id: result.file_id } })
        return res.json({
            ok: true,
            file_id: result.file_id,
            message_id: result.message_id,
        });
    }
    catch (err) {
        logger.error(`❌ Telegram upload failed: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3VwbG9hZC1wYXltZW50LXByb29mL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esb0JBNERDO0FBOURELG9EQUF5RDtBQUVsRCxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFMUMsSUFBSSxDQUFDO1FBQ0gsaUZBQWlGO1FBQ2pGLE1BQU0sS0FBSyxHQUFJLEdBQVcsQ0FBQyxLQUVkLENBQUE7UUFFYixNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxzQ0FBc0MsRUFBRSxDQUFDLENBQUE7UUFDaEYsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNyQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLGlDQUFpQyxFQUFFLENBQUMsQ0FBQTtRQUMzRSxDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ3pDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFBO1FBQ2hFLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBMEMsQ0FBQTtRQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEVBQUUsUUFBUSxJQUFJLFNBQVMsQ0FBQTtRQUMzQyxNQUFNLFlBQVksR0FBRyxJQUFJLEVBQUUsYUFBYSxJQUFJLE9BQU8sQ0FBQTtRQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQTtRQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsTUFBTSxJQUFJLEdBQUcsQ0FBQTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLEVBQUUsUUFBUSxJQUFJLEtBQUssQ0FBQTtRQUV4QyxNQUFNLE9BQU8sR0FDWCwwQkFBMEI7WUFDMUIsY0FBYyxPQUFPLElBQUk7WUFDekIsTUFBTSxZQUFZLElBQUk7WUFDdEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM5QixNQUFNLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQTtRQUU1QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsNEJBQWlCLEVBQ3BDO1lBQ0UsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxJQUFJLFdBQVc7WUFDMUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLEVBQ0QsT0FBTyxDQUNSLENBQUE7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUUxRSxvRUFBb0U7UUFDcEUsaURBQWlEO1FBQ2pELG1HQUFtRztRQUVuRyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZCxFQUFFLEVBQUUsSUFBSTtZQUNSLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztZQUN2QixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7U0FDOUIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDeEQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0FBQ0gsQ0FBQyJ9