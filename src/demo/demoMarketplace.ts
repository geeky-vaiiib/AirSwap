/**
 * Demo marketplace data for company dashboard
 */
export interface DemoMarketplaceItem {
  id: string;
  contributor: string;
  ndviDelta: number;
  credits: number;
  date: string;
  price: number;
}

export const demoMarketplace: DemoMarketplaceItem[] = [
  {
    id: "MKT-001",
    contributor: "Amazon Conservation",
    ndviDelta: 14.2,
    credits: 847,
    date: "Dec 1, 2024",
    price: 12.50,
  },
  {
    id: "MKT-002",
    contributor: "Green Earth Fund",
    ndviDelta: 11.8,
    credits: 523,
    date: "Nov 28, 2024",
    price: 8.75,
  },
  {
    id: "MKT-003",
    contributor: "Rainforest Alliance",
    ndviDelta: 16.5,
    credits: 1024,
    date: "Nov 25, 2024",
    price: 15.00,
  },
  {
    id: "MKT-004",
    contributor: "EcoTrust",
    ndviDelta: 9.3,
    credits: 412,
    date: "Nov 22, 2024",
    price: 6.25,
  },
];

export default demoMarketplace;

