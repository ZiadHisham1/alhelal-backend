import {
  AbstractFileProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderUploadFileDTO,
  ProviderFileResultDTO,
  ProviderDeleteFileDTO,
} from "@medusajs/framework/types"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

type Options = {
  supabaseUrl: string
  supabaseKey: string
  bucket: string
}

export class SupabaseFileProviderService extends AbstractFileProviderService {
  static identifier = "supabase"

  protected logger_: Logger
  protected options_: Options
  protected client_: SupabaseClient

  constructor({ logger }: { logger: Logger }, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.client_ = createClient(options.supabaseUrl, options.supabaseKey)
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    const buffer =
      typeof file.content === "string"
        ? Buffer.from(file.content, "base64")
        : Buffer.from(file.content)

    const { data, error } = await this.client_.storage
      .from(this.options_.bucket)
      .upload(file.filename, buffer, {
        contentType: file.mimeType,
        upsert: false,
      })

    if (error) {
      this.logger_.error(`[file-supabase] upload failed: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message)
    }

    const { data: pub } = this.client_.storage
      .from(this.options_.bucket)
      .getPublicUrl(data.path)

    return { url: pub.publicUrl, key: data.path }
  }

  async delete(file: ProviderDeleteFileDTO): Promise<void> {
    const { error } = await this.client_.storage
      .from(this.options_.bucket)
      .remove([file.fileKey])

    if (error) {
      this.logger_.error(`[file-supabase] delete failed: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message)
    }
  }
}