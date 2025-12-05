/**
 * Demo pending claims data for verifier dashboard
 */
export interface DemoPendingClaim {
  id: string;
  contributor: string;
  location: string;
  date: string;
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

export const demoPendingClaims: DemoPendingClaim[] = [
  {
    id: "CLM-101",
    contributor: "Amazon Conservation",
    location: "Amazon Basin, Brazil",
    date: "Dec 2, 2024",
    ndviDelta: 14.2,
    beforeImage: "/demo/before.jpg",
    afterImage: "/demo/after.jpg",
  },
  {
    id: "CLM-102",
    contributor: "Green Earth Fund",
    location: "Congo Rainforest",
    date: "Dec 1, 2024",
    ndviDelta: 11.8,
    beforeImage: "/demo/before.jpg",
    afterImage: "/demo/after.jpg",
  },
  {
    id: "CLM-103",
    contributor: "Rainforest Alliance",
    location: "Borneo, Indonesia",
    date: "Nov 30, 2024",
    ndviDelta: 9.5,
    beforeImage: "/demo/before.jpg",
    afterImage: "/demo/after.jpg",
  },
  {
    id: "CLM-104",
    contributor: "EcoTrust",
    location: "Sumatra, Indonesia",
    date: "Nov 28, 2024",
    ndviDelta: 10.2,
    beforeImage: "/demo/before.jpg",
    afterImage: "/demo/after.jpg",
  },
];

export default demoPendingClaims;

