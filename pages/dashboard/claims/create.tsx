/**
 * Create Claim Page - Simplified Single Form
 * 
 * Collects all claim information without map integration.
 * Users can manually enter coordinates or upload a GeoJSON file.
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const claimFormSchema = z.object({
  // Contributor info
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  
  // Land details
  country: z.string().min(2, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z.string().optional(),
  
  // Coordinates (simplified - 4 corner points)
  coordinatesText: z.string().min(10, 'Please provide coordinates in format: lat,lng; lat,lng; ...'),
  
  // Land info
  landSize: z.string().min(1, 'Land size is required'),
  landSizeUnit: z.enum(['hectares', 'acres', 'sqm']),
  vegetationType: z.string().min(1, 'Vegetation type is required'),
  
  // Claim details
  description: z.string().min(20, 'Description must be at least 20 characters'),
  expectedCredits: z.string().optional(),
  
  // Consent
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm ownership or permission',
  }),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

export default function CreateClaimPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      landSizeUnit: 'hectares',
      consent: false,
    },
  });

  const consent = watch('consent');

  // Parse coordinates from text input
  const parseCoordinates = (coordText: string): number[][][] => {
    try {
      // Expected format: "lat1,lng1; lat2,lng2; lat3,lng3; lat4,lng4"
      const points = coordText
        .split(';')
        .map(point => {
          const [lat, lng] = point.trim().split(',').map(Number);
          return [lng, lat]; // GeoJSON uses [lng, lat]
        })
        .filter(point => !isNaN(point[0]) && !isNaN(point[1]));

      if (points.length < 3) {
        throw new Error('At least 3 points required');
      }

      // Close the polygon
      points.push(points[0]);

      return [points];
    } catch (error) {
      console.error('Coordinate parsing error:', error);
      return [[[0, 0], [0, 0], [0, 0], [0, 0]]];
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 20 * 1024 * 1024; // 20MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 20MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const onSubmit = async (data: ClaimFormData) => {
    try {
      setIsSubmitting(true);

      // Parse coordinates
      const coordinates = parseCoordinates(data.coordinatesText);

      // Prepare claim data
      const claimData = {
        contributorName: data.fullName,
        contributorEmail: data.email,
        phone: data.phone,
        location: {
          country: data.country,
          state: data.state,
          city: data.city,
          description: data.locationDescription,
          polygon: {
            type: 'Polygon' as const,
            coordinates,
          },
        },
        areaHectares: parseFloat(data.landSize),
        description: `${data.description}\n\nLand Size: ${data.landSize} ${data.landSizeUnit}\nVegetation: ${data.vegetationType}`,
        expectedCredits: data.expectedCredits ? parseInt(data.expectedCredits) : undefined,
        evidence: uploadedFiles.map((file, index) => ({
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
          tmpId: `temp-${Date.now()}-${index}`,
        })),
      };

      // Submit to API
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Claim submitted successfully!');
        router.push(`/dashboard/claims/${result.data._id}`);
      } else {
        toast.error(result.error || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Submit New Claim | AirSwap</title>
        <meta name="description" content="Submit a new carbon credit claim" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/claims">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Claims
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Submit New Claim</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to submit your carbon credit claim
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contributor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Provide your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  {...register('phone')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Where is your land located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    {...register('country')}
                    aria-invalid={!!errors.country}
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="Karnataka"
                    {...register('state')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Bengaluru"
                    {...register('city')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationDescription">Location Description</Label>
                <Textarea
                  id="locationDescription"
                  placeholder="e.g., Rural farmland near village XYZ"
                  {...register('locationDescription')}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinatesText">Land Coordinates *</Label>
                <Textarea
                  id="coordinatesText"
                  placeholder="Enter coordinates as: 12.9716,77.5946; 12.9717,77.5947; 12.9718,77.5946; 12.9717,77.5945"
                  {...register('coordinatesText')}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Format: latitude,longitude; separated by semicolons. Minimum 3 points (will be closed automatically).
                </p>
                {errors.coordinatesText && (
                  <p className="text-sm text-destructive">{errors.coordinatesText.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Land Details */}
          <Card>
            <CardHeader>
              <CardTitle>Land Details</CardTitle>
              <CardDescription>Describe your land and vegetation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landSize">Land Size *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="landSize"
                      type="number"
                      step="0.01"
                      placeholder="2.5"
                      {...register('landSize')}
                      aria-invalid={!!errors.landSize}
                      className="flex-1"
                    />
                    <Select
                      defaultValue="hectares"
                      onValueChange={(value) => setValue('landSizeUnit', value as any)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="sqm">Sq Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.landSize && (
                    <p className="text-sm text-destructive">{errors.landSize.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vegetationType">Vegetation Type *</Label>
                  <Input
                    id="vegetationType"
                    placeholder="e.g., Mixed forest, Grassland, Cropland"
                    {...register('vegetationType')}
                    aria-invalid={!!errors.vegetationType}
                  />
                  {errors.vegetationType && (
                    <p className="text-sm text-destructive">{errors.vegetationType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your land restoration or conservation project..."
                  {...register('description')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCredits">Expected Carbon Credits (Optional)</Label>
                <Input
                  id="expectedCredits"
                  type="number"
                  placeholder="100"
                  {...register('expectedCredits')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evidence Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence Documents</CardTitle>
              <CardDescription>
                Upload land documents, satellite images, or photographs (JPG, PNG, PDF - Max 20MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload files</span>
                  <span className="text-xs text-muted-foreground">
                    or drag and drop files here
                  </span>
                </Label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consent */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setValue('consent', checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that I am the owner or have permission to submit this claim *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you confirm that all information provided is accurate
                    and you have the legal right to submit this claim.
                  </p>
                  {errors.consent && (
                    <p className="text-sm text-destructive">{errors.consent.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              Your claim will be reviewed by our verification team. You'll receive an email notification
              once the review is complete. Average review time is 3-5 business days.
            </AlertDescription>
          </Alert>
        </form>
      </div>
    </>
  );
}
