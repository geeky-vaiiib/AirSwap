/**
 * Google Earth Engine NDVI Analysis Service
 * 
 * This service uses Google Earth Engine to analyze NDVI (Normalized Difference Vegetation Index)
 * from Sentinel-2 satellite imagery for land parcels.
 * 
 * @requires @google/earthengine
 */

// @ts-ignore - No type definitions available for @google/earthengine
import ee from '@google/earthengine';
import fs from 'fs';
import path from 'path';

interface NDVIAnalysisResult {
  beforeNDVI: number;
  afterNDVI: number;
  improvement: number;
  improvementPercentage: number;
  passed: boolean;
  imageCount: {
    before: number;
    after: number;
  };
  cloudCover: {
    before: number;
    after: number;
  };
}

interface GeometryInput {
  type: string;
  coordinates: number[][][];
}

let isAuthenticated = false;

/**
 * Initialize and authenticate with Google Earth Engine
 */
export async function initializeEarthEngine(): Promise<void> {
  if (isAuthenticated) {
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      // Get credentials from environment
      const serviceAccountEmail = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
      const privateKeyPath = process.env.GEE_PRIVATE_KEY_PATH;

      if (!serviceAccountEmail || !privateKeyPath) {
        throw new Error(
          'GEE credentials not configured. Set GEE_SERVICE_ACCOUNT_EMAIL and GEE_PRIVATE_KEY_PATH in .env.local'
        );
      }

      // Read private key
      const keyPath = path.resolve(process.cwd(), privateKeyPath);
      
      if (!fs.existsSync(keyPath)) {
        throw new Error(
          `GEE private key file not found at: ${keyPath}\n` +
          'Please follow GEE_SETUP_GUIDE.md to set up your service account.'
        );
      }

      const privateKey = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

      // Authenticate with Earth Engine
      ee.data.authenticateViaPrivateKey(
        privateKey,
        () => {
          console.log('✅ Earth Engine authenticated successfully');
          
          // Initialize the library
          ee.initialize(
            null,
            null,
            () => {
              console.log('✅ Earth Engine initialized');
              isAuthenticated = true;
              resolve();
            },
            (error: Error) => {
              console.error('❌ Earth Engine initialization failed:', error);
              reject(error);
            }
          );
        },
        (error: Error) => {
          console.error('❌ Earth Engine authentication failed:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('❌ Error setting up Earth Engine:', error);
      reject(error);
    }
  });
}

/**
 * Analyze NDVI for a given geometry and time period
 */
export async function analyzeNDVI(
  geometry: GeometryInput,
  beforeDate: string | Date,
  afterDate: string | Date
): Promise<NDVIAnalysisResult> {
  // Ensure Earth Engine is initialized
  await initializeEarthEngine();

  try {
    console.log('📊 Starting NDVI analysis with Google Earth Engine...');
    
    // Convert dates to ISO strings
    const beforeDateStr = typeof beforeDate === 'string' ? beforeDate : beforeDate.toISOString().split('T')[0];
    const afterDateStr = typeof afterDate === 'string' ? afterDate : afterDate.toISOString().split('T')[0];
    
    console.log('   Before date:', beforeDateStr);
    console.log('   After date:', afterDateStr);

    // Create Earth Engine geometry from GeoJSON
    const eeGeometry = ee.Geometry.Polygon(geometry.coordinates);

    // Calculate "before" period (1 month window)
    const beforeStart = new Date(beforeDateStr);
    beforeStart.setMonth(beforeStart.getMonth() - 1);
    const beforeEnd = new Date(beforeDateStr);

    // Calculate "after" period (1 month window)
    const afterStart = new Date(afterDateStr);
    const afterEnd = new Date(afterDateStr);
    afterEnd.setMonth(afterEnd.getMonth() + 1);

    console.log('   Analyzing period 1:', beforeStart.toISOString().split('T')[0], 'to', beforeEnd.toISOString().split('T')[0]);
    console.log('   Analyzing period 2:', afterStart.toISOString().split('T')[0], 'to', afterEnd.toISOString().split('T')[0]);

    // Get NDVI for "before" period
    const beforeResult = await calculatePeriodNDVI(
      eeGeometry,
      beforeStart.toISOString().split('T')[0],
      beforeEnd.toISOString().split('T')[0]
    );

    // Get NDVI for "after" period
    const afterResult = await calculatePeriodNDVI(
      eeGeometry,
      afterStart.toISOString().split('T')[0],
      afterEnd.toISOString().split('T')[0]
    );

    console.log('   Before NDVI:', beforeResult.ndvi.toFixed(3), `(${beforeResult.imageCount} images, ${beforeResult.cloudCover.toFixed(1)}% clouds)`);
    console.log('   After NDVI:', afterResult.ndvi.toFixed(3), `(${afterResult.imageCount} images, ${afterResult.cloudCover.toFixed(1)}% clouds)`);

    // Calculate improvement
    const improvement = afterResult.ndvi - beforeResult.ndvi;
    const improvementPercentage = (improvement / beforeResult.ndvi) * 100;

    // Pass if NDVI improved by more than 0.1 (or 10% relative improvement)
    const passed = improvement > 0.1 || improvementPercentage > 10;

    console.log('   Improvement:', improvement.toFixed(3), `(${improvementPercentage.toFixed(1)}%)`);
    console.log('   Status:', passed ? '✅ PASSED' : '❌ FAILED');

    return {
      beforeNDVI: Number(beforeResult.ndvi.toFixed(3)),
      afterNDVI: Number(afterResult.ndvi.toFixed(3)),
      improvement: Number(improvement.toFixed(3)),
      improvementPercentage: Number(improvementPercentage.toFixed(2)),
      passed,
      imageCount: {
        before: beforeResult.imageCount,
        after: afterResult.imageCount,
      },
      cloudCover: {
        before: Number(beforeResult.cloudCover.toFixed(1)),
        after: Number(afterResult.cloudCover.toFixed(1)),
      },
    };
  } catch (error: any) {
    console.error('❌ NDVI analysis failed:', error);
    throw new Error(`NDVI analysis failed: ${error.message}`);
  }
}

/**
 * Calculate average NDVI for a specific time period
 */
async function calculatePeriodNDVI(
  geometry: any,
  startDate: string,
  endDate: string
): Promise<{ ndvi: number; imageCount: number; cloudCover: number }> {
  return new Promise((resolve, reject) => {
    try {
      // Load Sentinel-2 Surface Reflectance collection
      let collection = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(startDate, endDate)
        .filterBounds(geometry)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)); // Less than 20% clouds

      // Calculate NDVI for each image
      collection = collection.map((image: any) => {
        const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
        return image.addBands(ndvi);
      });

      // Get image count
      collection.size().evaluate((imageCount: number) => {
        if (imageCount === 0) {
          reject(new Error(`No clear Sentinel-2 images found for period ${startDate} to ${endDate}`));
          return;
        }

        // Calculate median NDVI to reduce cloud/shadow effects
        const medianNDVI = collection.select('NDVI').median();

        // Calculate mean NDVI over the region
        const stats = medianNDVI.reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: geometry,
          scale: 10, // 10m resolution for Sentinel-2
          maxPixels: 1e9,
        });

        // Get average cloud cover
        const avgCloudCover = collection
          .aggregate_mean('CLOUDY_PIXEL_PERCENTAGE');

        // Evaluate results
        Promise.all([
          new Promise((res) => stats.get('NDVI').evaluate(res)),
          new Promise((res) => avgCloudCover.evaluate(res)),
        ])
          .then(([ndviValue, cloudValue]) => {
            if (ndviValue === null || ndviValue === undefined) {
              reject(new Error('Could not calculate NDVI for this region'));
              return;
            }

            resolve({
              ndvi: ndviValue as number,
              imageCount: imageCount,
              cloudCover: cloudValue as number,
            });
          })
          .catch(reject);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Test Earth Engine connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await initializeEarthEngine();
    
    // Try a simple query
    const testCollection = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterDate('2024-01-01', '2024-01-31')
      .limit(1);

    return new Promise((resolve) => {
      testCollection.size().evaluate((count: number) => {
        console.log('✅ Earth Engine connection test passed');
        console.log(`   Found ${count} test images`);
        resolve(true);
      });
    });
  } catch (error) {
    console.error('❌ Earth Engine connection test failed:', error);
    return false;
  }
}

/**
 * Get available image count for a region and time period
 */
export async function getImageCount(
  geometry: GeometryInput,
  startDate: string,
  endDate: string
): Promise<number> {
  await initializeEarthEngine();

  return new Promise((resolve, reject) => {
    try {
      const eeGeometry = ee.Geometry.Polygon(geometry.coordinates);
      
      const collection = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(startDate, endDate)
        .filterBounds(eeGeometry)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

      collection.size().evaluate((count: number) => {
        resolve(count);
      });
    } catch (error) {
      reject(error);
    }
  });
}
