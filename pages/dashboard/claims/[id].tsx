/**
 * Claim Detail Page - View Complete Claim Information
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, FileText, Image, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Claim {
  _id: string;
  claimId: string;
  parentHash: string;
  status: 'pending' | 'verified' | 'rejected';
  contributorName: string;
  contributorEmail: string;
  phone?: string;
  location: {
    country: string;
    state?: string;
    city?: string;
    description?: string;
    polygon: any;
  };
  areaHectares?: number;
  description: string;
  expectedCredits?: number;
  evidence: Array<{
    name: string;
    type: string;
    url: string;
    cid?: string;
    uploadedAt: string;
  }>;
  ndvi?: {
    ndviDelta?: number;
    beforeImageCid?: string;
    afterImageCid?: string;
    processedAt?: string;
  };
  creditsIssued?: number;
  verifierNotes?: string;
  createdAt: string;
  updatedAt?: string;
  verifiedAt?: string;
  auditLog: Array<{
    event: string;
    userName?: string;
    note?: string;
    timestamp: string;
  }>;
}

export default function ClaimDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchClaim();
    }
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/claims/${id}`);
      const data = await response.json();

      if (data.success) {
        setClaim(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch claim');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch claim error:', err);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Claim not found'}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => router.back()} variant="outline">Go Back</Button>
              <Button onClick={fetchClaim}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{claim.claimId} | AirSwap</title>
        <meta name="description" content={`Claim details for ${claim.claimId}`} />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{claim.claimId}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {[claim.location.city, claim.location.state, claim.location.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
            <Badge className={getStatusColor(claim.status)}>
              {claim.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="ndvi">NDVI Data</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Claim ID</label>
                    <p className="mt-1 font-mono text-sm">{claim.claimId}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parent Hash</label>
                    <p className="mt-1 font-mono text-xs break-all">{claim.parentHash}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="mt-1">{format(new Date(claim.createdAt), 'PPpp')}</p>
                  </div>

                  {claim.verifiedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Verified</label>
                      <p className="mt-1">{format(new Date(claim.verifiedAt), 'PPpp')}</p>
                    </div>
                  )}

                  {claim.areaHectares && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Area</label>
                      <p className="mt-1">{claim.areaHectares} hectares</p>
                    </div>
                  )}

                  {claim.creditsIssued && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Credits Issued</label>
                      <p className="mt-1 text-green-600 font-semibold">{claim.creditsIssued}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-2 text-sm leading-relaxed">{claim.description}</p>
                </div>

                {claim.location.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location Details</label>
                    <p className="mt-2 text-sm leading-relaxed">{claim.location.description}</p>
                  </div>
                )}

                {claim.verifierNotes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verifier Notes</label>
                    <p className="mt-2 text-sm leading-relaxed p-3 bg-muted rounded-md">{claim.verifierNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contributor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="mt-1">{claim.contributorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{claim.contributorEmail}</p>
                </div>
                {claim.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="mt-1">{claim.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Files</CardTitle>
                <CardDescription>{claim.evidence.length} file(s) uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                {claim.evidence.length === 0 ? (
                  <p className="text-muted-foreground">No evidence files uploaded</p>
                ) : (
                  <div className="space-y-3">
                    {claim.evidence.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {file.type === 'image' ? (
                            <Image className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-600" />
                          )}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {format(new Date(file.uploadedAt), 'PPp')}
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {claim.status === 'pending' && (
                  <div className="mt-6">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/claims/${claim._id}/append-evidence`}>
                        Add More Evidence
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NDVI Tab */}
          <TabsContent value="ndvi">
            <Card>
              <CardHeader>
                <CardTitle>NDVI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {claim.ndvi ? (
                  <div className="space-y-4">
                    {claim.ndvi.ndviDelta !== undefined && (
                      <div className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">NDVI Delta: {claim.ndvi.ndviDelta.toFixed(4)}</span>
                      </div>
                    )}
                    {claim.ndvi.processedAt && (
                      <p className="text-sm text-muted-foreground">
                        Processed: {format(new Date(claim.ndvi.processedAt), 'PPp')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">NDVI analysis not yet performed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Complete history of claim actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.auditLog.map((entry, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                        {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.event.replace(/_/g, ' ').toUpperCase()}</p>
                        {entry.userName && (
                          <p className="text-sm text-muted-foreground">by {entry.userName}</p>
                        )}
                        {entry.note && (
                          <p className="text-sm mt-1">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
