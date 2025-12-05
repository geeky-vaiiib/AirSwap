import type { NextApiRequest, NextApiResponse } from "next";

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

  // Demo stub response
  res.status(200).json({
    ndviDelta: 14.2,
    beforeImage: "/demo/before.jpg",
    afterImage: "/demo/after.jpg",
  });
}


