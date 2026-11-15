import { apiClient } from "../../../../../../shared/services/api-client";
import { handleApiError, logError } from "../../../../../../shared/utils";
import { registerRequestSchema } from "../schema/register-request-schema";
import { registerResponseSchema } from "../schema/register-response-schema";
import type { RegisteredUser } from "../types/register.types";

const REGISTER_ENDPOINT = "/users";

export async function registerService(input: unknown): Promise<RegisteredUser> {
  try {
    const request = registerRequestSchema.parse(input);
    const { data } = await apiClient.post<unknown>(REGISTER_ENDPOINT, request);
    return registerResponseSchema.parse(data);
  } catch (error) {
    const apiError = handleApiError(error);
    logError("registerService", apiError);
    throw new Error(apiError.message);
  }
}
