"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseFileProviderService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseFileProviderService extends utils_1.AbstractFileProviderService {
    constructor({ logger }, options) {
        super();
        this.logger_ = logger;
        this.options_ = options;
        this.client_ = (0, supabase_js_1.createClient)(options.supabaseUrl, options.supabaseKey);
    }
    async upload(file) {
        const buffer = typeof file.content === "string"
            ? Buffer.from(file.content, "base64")
            : Buffer.from(file.content);
        const { data, error } = await this.client_.storage
            .from(this.options_.bucket)
            .upload(file.filename, buffer, {
            contentType: file.mimeType,
            upsert: false,
        });
        if (error) {
            this.logger_.error(`[file-supabase] upload failed: ${error.message}`);
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, error.message);
        }
        const { data: pub } = this.client_.storage
            .from(this.options_.bucket)
            .getPublicUrl(data.path);
        return { url: pub.publicUrl, key: data.path };
    }
    async delete(file) {
        const { error } = await this.client_.storage
            .from(this.options_.bucket)
            .remove([file.fileKey]);
        if (error) {
            this.logger_.error(`[file-supabase] delete failed: ${error.message}`);
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, error.message);
        }
    }
}
exports.SupabaseFileProviderService = SupabaseFileProviderService;
SupabaseFileProviderService.identifier = "supabase";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2ZpbGUtc3VwYWJhc2Uvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFHa0M7QUFPbEMsdURBQW9FO0FBUXBFLE1BQWEsMkJBQTRCLFNBQVEsbUNBQTJCO0lBTzFFLFlBQVksRUFBRSxNQUFNLEVBQXNCLEVBQUUsT0FBZ0I7UUFDMUQsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsMEJBQVksRUFBQyxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUEyQjtRQUN0QyxNQUFNLE1BQU0sR0FDVixPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssUUFBUTtZQUM5QixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztZQUNyQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7UUFFL0IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTzthQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO1lBQzdCLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUMxQixNQUFNLEVBQUUsS0FBSztTQUNkLENBQUMsQ0FBQTtRQUVKLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDckUsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzFFLENBQUM7UUFFRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTzthQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUUxQixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUMvQyxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUEyQjtRQUN0QyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87YUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzFCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBRXpCLElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDckUsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzFFLENBQUM7SUFDSCxDQUFDOztBQWhESCxrRUFpREM7QUFoRFEsc0NBQVUsR0FBRyxVQUFVLENBQUEifQ==