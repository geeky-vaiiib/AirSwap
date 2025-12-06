"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, User, TrendingUp, Eye, RefreshCw } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import VerifierModal from "@/components/dashboard/VerifierModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isDemo } from "@/lib/isDemo";
import { demoPendingClaims, type DemoPendingClaim } from "@/demo/demoPendingClaims";

interface RealClaim {
  _id: string;
  claimId: string;
  contributorId: string;
  contributorName: string;
  contributorEmail: string;
  location: {
    country: string;
    state?: string;
    city?: string;
    polygon: any;
  };
  areaHectares: number;
  status: 'pending' | 'verified' | 'rejected';
  ndviData?: {
    beforeNDVI?: number;
    afterNDVI?: number;
    delta?: number;
  };
  createdAt: string;
  verifiedAt?: string;
}

const VerifierDashboard = () => {
  const [pendingClaims, setPendingClaims] = useState<DemoPendingClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<DemoPendingClaim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0,
  });

  const fetchClaims = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (isDemo()) {
        setPendingClaims(demoPendingClaims);
        setStats({
          pending: demoPendingClaims.length,
          approved: 156,
          rejected: 12,
          approvalRate: 92.8,
        });
      } else {
        const pendingResponse = await fetch('/api/claims/index-v2?status=pending');
        const pendingData = await pendingResponse.json();

        if (pendingData.success) {
          const claims: RealClaim[] = pendingData.data;
          
          const transformedClaims = claims.map((claim): DemoPendingClaim => ({
            id: claim.claimId || claim._id,
            contributor: claim.contributorName || claim.contributorEmail,
            location: `${claim.location.city ? claim.location.city + ', ' : ''}${claim.location.country}`,
            ndviDelta: claim.ndviData?.delta ? Number(claim.ndviData.delta.toFixed(2)) : 0,
            date: new Date(claim.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            beforeImage: '',
            afterImage: '',
          }));

          setPendingClaims(transformedClaims);

          const [verifiedRes, rejectedRes] = await Promise.all([
            fetch('/api/claims/index-v2?status=verified'),
            fetch('/api/claims/index-v2?status=rejected'),
          ]);

          const [verifiedData, rejectedData] = await Promise.all([
            verifiedRes.json(),
            rejectedRes.json(),
          ]);

          const approvedCount = verifiedData.success ? verifiedData.data.length : 0;
          const rejectedCount = rejectedData.success ? rejectedData.data.length : 0;
          const total = claims.length + approvedCount + rejectedCount;
          const approvalRate = total > 0 ? (approvedCount / total) * 100 : 0;

          setStats({
            pending: claims.length,
            approved: approvedCount,
            rejected: rejectedCount,
            approvalRate: Number(approvalRate.toFixed(1)),
          });
        } else {
          toast({
            title: "Error",
            description: pendingData.error || "Failed to fetch claims",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to load claims. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchClaims(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchClaims]);

  const handleRefresh = () => {
    fetchClaims(true);
    toast({
      title: "Refreshing",
      description: "Fetching latest claims...",
    });
  };

  const handleView = (claim: DemoPendingClaim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    toast({
      title: "Claim Approved! ✓",
      description: `Claim ${selectedClaim?.id} has been verified and credits issued.`,
    });
    setIsModalOpen(false);
    fetchClaims(true);
  };

  const handleReject = () => {
    toast({
      title: "Claim Rejected",
      description: `Claim ${selectedClaim?.id} has been rejected.`,
      variant: "destructive",
    });
    setIsModalOpen(false);
    fetchClaims(true);
  };

  const handleRequestMore = () => {
    toast({
      title: "Request Sent",
      description: `Additional evidence requested for claim ${selectedClaim?.id}.`,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-sand">
      <DashboardSidebar role="verifier" />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-forest mb-2">
                  Verifier Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Review and verify land claims submitted by contributors.
                  {lastUpdated && (
                    <span className="block text-xs mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {stats.approved}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {stats.rejected}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-forest" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {stats.approvalRate}%
              </div>
              <div className="text-sm text-muted-foreground">Approval Rate</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                Pending Claims
              </h2>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-forest/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-forest">
                      Claim ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-forest">
                      Contributor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-forest">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-forest">
                      NDVI Change
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-forest">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-forest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading claims...
                        </div>
                      </td>
                    </tr>
                  ) : pendingClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="space-y-2">
                          <p>No pending claims at the moment.</p>
                          {!isDemo() && (
                            <p className="text-sm">New claims will appear here automatically.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingClaims.map((claim, index) => (
                    <motion.tr
                      key={claim.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="hover:bg-forest/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-forest">
                          {claim.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-forest" />
                          </div>
                          <span className="text-sm text-forest">
                            {claim.contributor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {claim.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal/20 text-teal text-sm font-medium">
                          <TrendingUp className="w-3 h-3" />
                          +{claim.ndviDelta}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {claim.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(claim)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      <VerifierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        claim={selectedClaim}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestMore={handleRequestMore}
      />
    </div>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {}
  };
};

export default VerifierDashboard;
