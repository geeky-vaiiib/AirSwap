/**
 * Demo credits data
 */
export interface DemoCredit {
  id: string;
  tokenId: string;
  metadataCID: string;
  ndviDelta: number;
  credits: number;
  date: string;
  location?: string;
}

export const demoCredits: DemoCredit[] = [
  {
    id: "CRD-001",
    tokenId: "0x1234...5678",
    metadataCID: "QmXxx...Yyy",
    ndviDelta: 14.2,
    credits: 847,
    date: "Dec 1, 2024",
    location: "Amazon Basin, Brazil",
  },
  {
    id: "CRD-002",
    tokenId: "0x2345...6789",
    metadataCID: "QmYyy...Zzz",
    ndviDelta: 11.8,
    credits: 523,
    date: "Nov 28, 2024",
    location: "Congo Rainforest",
  },
  {
    id: "CRD-003",
    tokenId: "0x3456...7890",
    metadataCID: "QmZzz...Aaa",
    ndviDelta: 8.5,
    credits: 523,
    date: "Nov 25, 2024",
    location: "Borneo, Indonesia",
  },
  {
    id: "CRD-004",
    tokenId: "0x4567...8901",
    metadataCID: "QmAaa...Bbb",
    ndviDelta: 12.3,
    credits: 689,
    date: "Nov 20, 2024",
    location: "Sumatra, Indonesia",
  },
];

export default demoCredits;

