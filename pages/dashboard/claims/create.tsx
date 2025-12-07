/**
 * Multi-Step Claim Creation Form
 *
 * 5-step wizard for creating carbon credit claims:
 * 1. Contributor Details
 * 2. Land Location & Map
 * 3. Evidence Upload
 * 4. Claim Metadata
 * 5. Review & Submit
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Loader2, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import type { UploadedPhoto } from '@/components/claims/EvidencePhotoUploader';

// Dynamic imports for map and file uploader components
const PolygonDrawer = dynamic(() => import('@/components/map/PolygonDrawer'), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted rounded-lg animate-pulse" />
});

const EvidencePhotoUploader = dynamic(() => import('@/components/claims/EvidencePhotoUploader').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <div className="h-48 bg-muted rounded-lg animate-pulse" />
});

// Complete form schema with all fields
const completeFormSchema = z.object({
  // Step 1
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  // Step 2
  country: z.string().min(2, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z.string().optional(),
  polygon: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number().min(-180).max(180)).length(2))).min(1)
  }),
  // Step 3
  beforeEvidence: z.array(z.object({
    file: z.any(),
    name: z.string(),
    type: z.enum(['image']),
    url: z.string().optional(),
  })).min(1, 'At least one before reforestation photo is required'),
  afterEvidence: z.array(z.object({
    file: z.any(),
    name: z.string(),
    type: z.enum(['image']),
    url: z.string().optional(),
  })).min(1, 'At least one after reforestation photo is required'),
  // Step 4
  description: z.string().min(20, 'Description must be at least 20 characters'),
  areaHectares: z.number().min(0.01, 'Area must be greater than 0'),
  expectedCredits: z.number().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm ownership or permission',
  }),
});

// Validation schemas for each step (used for step-by-step validation)
const stepSchemas = {
  1: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
  }),
  2: z.object({
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    city: z.string().optional(),
    locationDescription: z.string().optional(),
    polygon: z.object({
      type: z.literal('Polygon'),
      coordinates: z.array(z.array(z.array(z.number().min(-180).max(180)).length(2))).min(1)
    }),
  }),
  3: z.object({
    beforeEvidence: z.array(z.object({
      file: z.any(),
      name: z.string(),
      type: z.enum(['image']),
      url: z.string().optional(),
    })).min(1, 'At least one before reforestation photo is required'),
    afterEvidence: z.array(z.object({
      file: z.any(),
      name: z.string(),
      type: z.enum(['image']),
      url: z.string().optional(),
    })).min(1, 'At least one after reforestation photo is required'),
  }),
  4: z.object({
    description: z.string().min(20, 'Description must be at least 20 characters'),
    areaHectares: z.number().min(0.01, 'Area must be greater than 0'),
    expectedCredits: z.number().optional(),
    consent: z.boolean().refine((val) => val === true, {
      message: 'You must confirm ownership or permission',
    }),
  }),
  5: completeFormSchema // Review step - validate all fields
};

type ClaimFormData = {
  // Step 1
  fullName: string;
  email: string;
  phone?: string;

  // Step 2
  country: string;
  state?: string;
  city?: string;
  locationDescription?: string;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  // Step 3
  beforeEvidence: UploadedPhoto[];
  afterEvidence: UploadedPhoto[];

  // Step 4
  description: string;
  areaHectares: number;
  expectedCredits?: number;
  consent: boolean;
};

export default function CreateClaimPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formMethods = useForm<ClaimFormData>({
    mode: 'onChange',
    defaultValues: {
      consent: false,
      beforeEvidence: [],
      afterEvidence: [],
    },
    // Use complete schema for final validation on submit
    // Step-by-step validation is handled manually in nextStep()
  });

  const { handleSubmit, watch, getValues, setValue } = formMethods;
  const totalSteps = 5;

  const stepTitles = [
    'Contributor Details',
    'Land Location & Map',
    'Evidence Upload',
    'Claim Metadata',
    'Review & Submit'
  ];

  const watchedValues = watch();
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = async () => {
    // Get current form values
    const currentValues = getValues();
    
    // Validate only the fields for the current step using Zod
    let validationResult;
    
    try {
      switch (currentStep) {
        case 1:
          validationResult = stepSchemas[1].parse({
            fullName: currentValues.fullName,
            email: currentValues.email,
            phone: currentValues.phone,
          });
          break;
        case 2:
          validationResult = stepSchemas[2].parse({
            country: currentValues.country,
            state: currentValues.state,
            city: currentValues.city,
            locationDescription: currentValues.locationDescription,
            polygon: currentValues.polygon,
          });
          break;
        case 3:
          validationResult = stepSchemas[3].parse({
            beforeEvidence: currentValues.beforeEvidence,
            afterEvidence: currentValues.afterEvidence,
          });
          break;
        case 4:
          validationResult = stepSchemas[4].parse({
            description: currentValues.description,
            areaHectares: currentValues.areaHectares,
            expectedCredits: currentValues.expectedCredits,
            consent: currentValues.consent,
          });
          break;
      }
      
      // Additional UI validation for specific steps
      if (currentStep === 2) {
        const polygon = currentValues.polygon;
        if (!polygon || !polygon.coordinates || polygon.coordinates.length === 0) {
          toast.error('Please draw a polygon on the map to define the land boundaries');
          return;
        }
      } else if (currentStep === 3) {
        const beforeEvidence = currentValues.beforeEvidence;
        const afterEvidence = currentValues.afterEvidence;
        if (!beforeEvidence || beforeEvidence.length === 0) {
          toast.error('Please upload at least one before reforestation photo');
          return;
        }
        if (!afterEvidence || afterEvidence.length === 0) {
          toast.error('Please upload at least one after reforestation photo');
          return;
        }
      }

      // Move to next step
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const prepareClaimData = (data: ClaimFormData) => {
    // Combine before and after evidence into single array
    const combinedEvidence = [
      ...(data.beforeEvidence || []).map(item => ({
        name: item.name,
        type: item.type as string,
        tmpId: `before-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: 'before' as const
      })),
      ...(data.afterEvidence || []).map(item => ({
        name: item.name,
        type: item.type as string,
        tmpId: `after-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: 'after' as const
      })),
    ];

    // Log claim data for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Claim data prepared:', {
        contributorName: data.fullName,
        contributorEmail: data.email,
        phone: data.phone,
        location: {
          country: data.country,
          state: data.state,
          city: data.city,
          description: data.locationDescription,
          polygon: data.polygon,
        },
        areaHectares: data.areaHectares,
        description: data.description,
        expectedCredits: data.expectedCredits,
        evidence: combinedEvidence,
      });
    }
    return {
      contributorName: data.fullName,
      contributorEmail: data.email,
      phone: data.phone,
      location: {
        country: data.country,
        state: data.state,
        city: data.city,
        description: data.locationDescription,
        polygon: data.polygon,
      },
      areaHectares: data.areaHectares,
      description: data.description,
      expectedCredits: data.expectedCredits,
      evidence: combinedEvidence,
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
                    {...formMethods.register('fullName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...formMethods.register('email')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  {...formMethods.register('phone')}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                      {...formMethods.register('country')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="Karnataka"
                      {...formMethods.register('state')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Bengaluru"
                      {...formMethods.register('city')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationDescription">Location Description</Label>
                  <Textarea
                    id="locationDescription"
                    placeholder="e.g., Rural farmland near village XYZ"
                    {...formMethods.register('locationDescription')}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <PolygonDrawer
              value={watchedValues.polygon}
              onChange={(polygon) => {
                if (polygon) {
                  setValue('polygon', polygon);
                }
              }}
            />
          </div>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reforestation Evidence Photos</CardTitle>
              <CardDescription>
                Upload before and after photos to demonstrate your reforestation work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvidencePhotoUploader
                beforePhotos={watchedValues.beforeEvidence}
                afterPhotos={watchedValues.afterEvidence}
                onBeforePhotosChange={(photos) => setValue('beforeEvidence', photos)}
                onAfterPhotosChange={(photos) => setValue('afterEvidence', photos)}
              />
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Claim Metadata</CardTitle>
              <CardDescription>Provide details about your carbon credit claim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your land restoration or conservation project..."
                  {...formMethods.register('description')}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="areaHectares">Land Area (Hectares) *</Label>
                  <Input
                    id="areaHectares"
                    type="number"
                    step="0.01"
                    placeholder="2.5"
                    {...formMethods.register('areaHectares', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCredits">Expected Carbon Credits (Optional)</Label>
                  <Input
                    id="expectedCredits"
                    type="number"
                    placeholder="100"
                    {...formMethods.register('expectedCredits', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Controller
                  name="consent"
                  control={formMethods.control}
                  render={({ field }) => (
                    <Checkbox
                      id="consent"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I confirm that I am the owner or have permission to submit this claim *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you confirm that all information provided is accurate
                    and you have the legal right to submit this claim.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Claim</CardTitle>
                <CardDescription>Please review all information before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contributor Info */}
                <div>
                  <h4 className="font-medium mb-2">Contributor Information</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{watchedValues.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{watchedValues.email}</span>
                    </div>
                    {watchedValues.phone && (
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-medium">{watchedValues.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location Info */}
                <div>
                  <h4 className="font-medium mb-2">Location Information</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Country:</span>
                      <span className="font-medium">{watchedValues.country}</span>
                    </div>
                    {watchedValues.state && (
                      <div className="flex justify-between">
                        <span>State:</span>
                        <span className="font-medium">{watchedValues.state}</span>
                      </div>
                    )}
                    {watchedValues.city && (
                      <div className="flex justify-between">
                        <span>City:</span>
                        <span className="font-medium">{watchedValues.city}</span>
                      </div>
                    )}
                    {watchedValues.locationDescription && (
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span className="font-medium">{watchedValues.locationDescription}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Evidence */}
                <div>
                  <h4 className="font-medium mb-2">Evidence Photos</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Before Reforestation ({watchedValues.beforeEvidence.length} photos)</h5>
                      <div className="space-y-1">
                        {watchedValues.beforeEvidence?.slice(0, 3).map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">Before</Badge>
                          </div>
                        ))}
                        {watchedValues.beforeEvidence.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{watchedValues.beforeEvidence.length - 3} more before photos
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">After Reforestation ({watchedValues.afterEvidence.length} photos)</h5>
                      <div className="space-y-1">
                        {watchedValues.afterEvidence?.slice(0, 3).map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">After</Badge>
                          </div>
                        ))}
                        {watchedValues.afterEvidence.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{watchedValues.afterEvidence.length - 3} more after photos
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Claim Details */}
                <div>
                  <h4 className="font-medium mb-2">Claim Details</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Description:</span>
                      <span className="font-medium text-right max-w-md">{watchedValues.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span className="font-medium">{watchedValues.areaHectares} hectares</span>
                    </div>
                    {watchedValues.expectedCredits && (
                      <div className="flex justify-between">
                        <span>Expected Credits:</span>
                        <span className="font-medium">{watchedValues.expectedCredits}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Consent:</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Submit form
  const onSubmit = async (data: ClaimFormData) => {
    // Validate we have all required data
    if (!data.fullName || !data.email) {
      toast.error('Missing required contributor information');
      setCurrentStep(1);
      return;
    }

    if (!data.polygon || !data.polygon.coordinates || data.polygon.coordinates.length === 0) {
      toast.error('Missing land polygon. Please go back and draw the land boundaries.');
      setCurrentStep(2);
      return;
    }

    if (!data.beforeEvidence || data.beforeEvidence.length === 0 || !data.afterEvidence || data.afterEvidence.length === 0) {
      toast.error('Missing evidence photos. Please upload at least one photo before and after reforestation.');
      setCurrentStep(3);
      return;
    }

    if (!data.description || !data.areaHectares || !data.consent) {
      toast.error('Missing required claim details');
      setCurrentStep(4);
      return;
    }

    try {
      setIsSubmitting(true);

      const claimData = prepareClaimData(data);

      const response = await fetch('/api/claims/index-v2', {
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
        // Log server errors only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Server error:', result.error);
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      // Log unexpected errors only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Submit error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
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
            Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              {stepTitles.map((title, index) => (
                <span
                  key={index}
                  className={`${
                    index + 1 <= currentStep ? 'text-primary font-medium' : ''
                  }`}
                >
                  {index + 1}. {title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1"
                disabled={isSubmitting}
              >
                Next: {stepTitles[currentStep]}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Claim...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </Button>
            )}
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
    </FormProvider>
  );
}
