import { handlers } from "@/auth";

const originalGET = handlers.GET;
const originalPOST = handlers.POST;

export const GET = async (...args: Parameters<typeof handlers.GET>) => {
  console.log("[AUTH] GET request:", args[0]?.url);
  return originalGET(...args);
};

export const POST = async (...args: Parameters<typeof handlers.POST>) => {
  console.log("[AUTH] POST request:", args[0]?.url);
  return originalPOST(...args);
};
