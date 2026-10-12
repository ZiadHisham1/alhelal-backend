import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SupabaseFileProviderService } from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [SupabaseFileProviderService],
})