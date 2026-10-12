import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendTelegramPhoto } from "../../../lib/telegram"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  try {
    // Medusa parses multipart automatically when Content-Type is multipart/form-data
    const files = (req as any).files as
      | Record<string, Array<{ buffer: Buffer; originalname: string; mimetype: string }>>
      | undefined

    const file = files?.proof?.[0]
    if (!file) {
      return res.status(400).json({ error: "No file uploaded under field 'proof'" })
    }

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
    if (!ALLOWED.includes(file.mimetype)) {
      return res.status(400).json({ error: "Only JPEG, PNG, or WebP allowed" })
    }
    if (file.buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Max file size is 5MB" })
    }

    const body = req.body as Record<string, string | undefined>
    const orderId = body?.order_id ?? "unknown"
    const customerName = body?.customer_name ?? "Guest"
    const email = body?.email ?? ""
    const amount = body?.amount ?? "?"
    const currency = body?.currency ?? "EGP"

    const caption =
      `💳 *New Payment Proof*\n` +
      `🧾 Order: #${orderId}\n` +
      `👤 ${customerName}\n` +
      (email ? `📧 ${email}\n` : "") +
      `💰 ${amount} ${currency}`

    const result = await sendTelegramPhoto(
      {
        buffer: file.buffer,
        filename: file.originalname || "proof.jpg",
        mimetype: file.mimetype,
      },
      caption
    )

    logger.info(`✅ Payment proof sent to Telegram. file_id=${result.file_id}`)

    // If you have an order/cart module, attach file_id to its metadata:
    // const orderModule = req.scope.resolve("order")
    // await orderModule.updateOrders(orderId, { metadata: { payment_proof_file_id: result.file_id } })

    return res.json({
      ok: true,
      file_id: result.file_id,
      message_id: result.message_id,
    })
  } catch (err: any) {
    logger.error(`❌ Telegram upload failed: ${err.message}`)
    return res.status(500).json({ error: err.message })
  }
}