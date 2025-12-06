/**
 * Claims List Page - Contributor Dashboard
 * 
 * Displays paginated list of contributor's claims with:
 * - Filtering by status
 * - Sorting options
 * - Status badges
 * - Actions (View, Edit, Withdraw)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  Plus, FileText, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Claim {
  _id: string;
  claimId: string;
  status: 'pending' | 'verified' | 'rejected';
  location: {
    country: string;
    state?: string;
    city?: string;
  };
  createdAt: string;
  ndvi?: {
    ndviDelta?: number;
  };
  creditsIssued?: number;
  description: string;
}

interface ClaimsResponse {
  success: boolean;
  data: Claim[];
  meta?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
  error?: string;
}

export default function ClaimsListPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ClaimsResponse['meta']>();

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, sortBy, sortOrder, page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/claims?${params}`);
      const data: ClaimsResponse = await response.json();

      if (data.success) {
        setClaims(data.data || []);
        setMeta(data.meta);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch claims');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch claims error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: Claim['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Head>
        <title>My Claims | AirSwap</title>
        <meta name="description" content="Manage your carbon credit claims" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your carbon credit claims
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/claims/create">
              <Plus className="mr-2 h-4 w-4" />
              New Claim
            </Link>
          </Button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="ndviDelta">NDVI Delta</SelectItem>
              <SelectItem value="creditsIssued">Credits</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading claims...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchClaims} className="mt-4" variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Claims List */}
        {!loading && !error && (
          <>
            {claims.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No claims found</p>
                  <p className="text-muted-foreground mb-6">
                    {statusFilter !== 'all'
                      ? `You don't have any ${statusFilter} claims yet.`
                      : "You haven't created any claims yet."}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/claims/create">Create Your First Claim</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{claim.claimId}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {[claim.location.city, claim.location.state, claim.location.country]
                              .filter(Boolean)
                              .join(', ')}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(claim.status)}>
                          {getStatusText(claim.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {claim.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(claim.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        
                        {claim.ndvi?.ndviDelta !== undefined && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span>NDVI: {claim.ndvi.ndviDelta.toFixed(3)}</span>
                          </div>
                        )}
                        
                        {claim.creditsIssued && (
                          <div className="font-medium text-green-600">
                            {claim.creditsIssued} credits
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => router.push(`/dashboard/claims/${claim._id}`)}
                        >
                          View Details
                        </Button>
                        
                        {claim.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/claims/${claim._id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.pages} ({meta.total} total claims)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                    disabled={page === meta.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
