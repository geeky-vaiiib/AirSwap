/**
 * Demo NDVI response data matching the API response shape
 */
export interface NDVIDemoResponse {
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

export const ndviDemoResponse: NDVIDemoResponse = {
  ndviDelta: 14.2,
  beforeImage: "/demo/before.jpg",
  afterImage: "/demo/after.jpg",
};

export default ndviDemoResponse;


