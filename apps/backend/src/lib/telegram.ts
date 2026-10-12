const TG_API = "https://api.telegram.org"

function token() {
  const t = process.env.TG_BOT_TOKEN
  if (!t) throw new Error("TG_BOT_TOKEN not set")
  return t
}

function chatId() {
  const c = process.env.TG_ADMIN_CHAT_ID
  if (!c) throw new Error("TG_ADMIN_CHAT_ID not set")
  return c
}

export async function sendTelegramMessage(text: string) {
  const res = await fetch(`${TG_API}/bot${token()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId(),
      text,
      parse_mode: "Markdown",
    }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram sendMessage failed: ${JSON.stringify(data)}`)
  return data.result
}

export async function sendTelegramPhoto(
  file: { buffer: Buffer; filename: string; mimetype: string },
  caption?: string
) {
  const form = new FormData()
  form.append("chat_id", chatId())
  if (caption) {
    form.append("caption", caption)
    form.append("parse_mode", "Markdown")
  }

  const blob = new Blob([file.buffer], { type: file.mimetype })
  form.append("photo", blob, file.filename)

  const res = await fetch(`${TG_API}/bot${token()}/sendPhoto`, {
    method: "POST",
    body: form,
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram sendPhoto failed: ${JSON.stringify(data)}`)

  // Largest photo is the last entry
  const photos = data.result.photo as Array<{ file_id: string; width: number; height: number }>
  const largest = photos[photos.length - 1]

  return {
    message_id: data.result.message_id as number,
    file_id: largest.file_id,
    width: largest.width,
    height: largest.height,
  }
}