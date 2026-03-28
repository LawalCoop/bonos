import { handlers } from "@/auth";

const originalGET = handlers.GET;
const originalPOST = handlers.POST;

export const GET = async (req: Request) => {
  console.log("[AUTH] GET request:", req.url);
  return originalGET(req);
};

export const POST = async (req: Request) => {
  console.log("[AUTH] POST request:", req.url);
  return originalPOST(req);
};
