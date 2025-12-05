/**
 * Demo claims data for contributor dashboard
 */
export interface DemoClaim {
  id: string;
  location: string;
  date: string;
  ndviDelta: number;
  status: "verified" | "pending" | "rejected";
  credits?: number;
}

export const demoClaims: DemoClaim[] = [
  {
    id: "CLM-001",
    location: "Amazon Basin, Brazil",
    date: "Dec 1, 2024",
    ndviDelta: 14.2,
    status: "verified",
    credits: 847,
  },
  {
    id: "CLM-002",
    location: "Congo Rainforest",
    date: "Nov 28, 2024",
    ndviDelta: 11.8,
    status: "pending",
  },
  {
    id: "CLM-003",
    location: "Borneo, Indonesia",
    date: "Nov 25, 2024",
    ndviDelta: 8.5,
    status: "verified",
    credits: 523,
  },
  {
    id: "CLM-004",
    location: "Sumatra, Indonesia",
    date: "Nov 20, 2024",
    ndviDelta: 12.3,
    status: "verified",
    credits: 689,
  },
];

export default demoClaims;

