import type { NextApiRequest, NextApiResponse } from "next";
import { isDemo } from "@/lib/isDemo";
import { ndviDemoResponse } from "@/demo/ndviDemoResponse";

interface NDVIResponse {
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<NDVIResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  // Return demo data only when demo mode is enabled
  if (isDemo()) {
    return res.status(200).json(ndviDemoResponse);
  }

  // TODO: Implement real NDVI API call
  // For now, return 501 Not Implemented in production
  return res.status(501).json({
    ndviDelta: 0,
    beforeImage: "",
    afterImage: "",
  } as any);
}



