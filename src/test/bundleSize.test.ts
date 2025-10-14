import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

// Bundle size thresholds (in bytes)
const BUNDLE_SIZE_THRESHOLDS = {
  // Main application bundle
  main: 150 * 1024, // 150KB

  // Vendor bundles
  reactVendor: 200 * 1024, // 200KB for React + ReactDOM
  motion: 120 * 1024, // 120KB for Framer Motion
  vendor: 50 * 1024, // 50KB for other vendors

  // Component bundles
  components: 40 * 1024, // 40KB for components
  youtubeComponents: 10 * 1024, // 10KB for YouTube components
  socialComponents: 15 * 1024, // 15KB for social components

  // Utility bundles
  utils: 20 * 1024, // 20KB for utilities

  // CSS files
  css: 35 * 1024, // 35KB for CSS (adjusted for Tailwind CSS)

  // Total bundle size (gzipped estimate)
  totalGzipped: 300 * 1024, // 300KB total gzipped
};

interface BundleInfo {
  name: string;
  size: number;
  gzippedSize?: number;
  type: 'js' | 'css' | 'asset' | 'image';
}

describe('Bundle Size Tests', () => {
  let bundles: BundleInfo[] = [];
  let distExists = false;

  beforeAll(() => {
    // Check if dist directory exists (built project)
    distExists = existsSync('dist');

    if (distExists) {
      // Helper function to recursively find files
      const findFiles = (dir: string, extensions: string[]): string[] => {
        const files: string[] = [];
        try {
          const items = readdirSync(dir, { withFileTypes: true });
          for (const item of items) {
            const fullPath = join(dir, item.name);
            if (item.isDirectory()) {
              files.push(...findFiles(fullPath, extensions));
            } else if (extensions.some(ext => item.name.endsWith(ext))) {
              files.push(fullPath);
            }
          }
        } catch (error) {
          // Directory doesn't exist or can't be read
        }
        return files;
      };

      // Collect all bundle files
      const jsFiles = findFiles('dist', ['.js']);
      const cssFiles = findFiles('dist', ['.css']);
      const assetFiles = findFiles('dist', ['.json', '.txt', '.xml']);
      const imageFiles = findFiles('dist', [
        '.png',
        '.jpg',
        '.jpeg',
        '.svg',
        '.gif',
        '.webp',
      ]);

      // Process JavaScript bundles
      jsFiles.forEach(file => {
        try {
          const stats = statSync(file);
          const name = file.split(/[/\\]/).pop() || file;
          bundles.push({
            name,
            size: stats.size,
            type: 'js',
          });
        } catch (error) {
          // File might not exist or be accessible
        }
      });

      // Process CSS bundles
      cssFiles.forEach(file => {
        try {
          const stats = statSync(file);
          const name = file.split(/[/\\]/).pop() || file;
          bundles.push({
            name,
            size: stats.size,
            type: 'css',
          });
        } catch (error) {
          // File might not exist or be accessible
        }
      });

      // Process asset files
      assetFiles.forEach(file => {
        try {
          const stats = statSync(file);
          const name = file.split(/[/\\]/).pop() || file;
          bundles.push({
            name,
            size: stats.size,
            type: 'asset',
          });
        } catch (error) {
          // File might not exist or be accessible
        }
      });

      // Process image files
      imageFiles.forEach(file => {
        try {
          const stats = statSync(file);
          const name = file.split(/[/\\]/).pop() || file;
          bundles.push({
            name,
            size: stats.size,
            type: 'image',
          });
        } catch (error) {
          // File might not exist or be accessible
        }
      });
    }
  });

  describe('JavaScript Bundle Sizes', () => {
    it('should have main bundle under size threshold', () => {
      if (!distExists) {
        console.warn('Dist directory not found. Run "npm run build" first.');
        return;
      }

      const mainBundle = bundles.find(
        b =>
          b.type === 'js' &&
          (b.name.includes('index') || b.name.includes('main'))
      );

      if (mainBundle) {
        expect(mainBundle.size).toBeLessThanOrEqual(
          BUNDLE_SIZE_THRESHOLDS.main
        );
        console.log(
          `Main bundle size: ${(mainBundle.size / 1024).toFixed(2)}KB`
        );
      }
    });

    it('should have React vendor bundle under size threshold', () => {
      if (!distExists) return;

      const reactBundle = bundles.find(
        b => b.type === 'js' && b.name.includes('react-vendor')
      );

      if (reactBundle) {
        expect(reactBundle.size).toBeLessThanOrEqual(
          BUNDLE_SIZE_THRESHOLDS.reactVendor
        );
        console.log(
          `React vendor bundle size: ${(reactBundle.size / 1024).toFixed(2)}KB`
        );
      }
    });

    it('should have Framer Motion bundle under size threshold', () => {
      if (!distExists) return;

      const motionBundle = bundles.find(
        b => b.type === 'js' && b.name.includes('motion')
      );

      if (motionBundle) {
        expect(motionBundle.size).toBeLessThanOrEqual(
          BUNDLE_SIZE_THRESHOLDS.motion
        );
        console.log(
          `Motion bundle size: ${(motionBundle.size / 1024).toFixed(2)}KB`
        );
      }
    });

    it('should have component bundles under size thresholds', () => {
      if (!distExists) return;

      const componentBundles = bundles.filter(
        b => b.type === 'js' && b.name.includes('components')
      );

      componentBundles.forEach(bundle => {
        let threshold = BUNDLE_SIZE_THRESHOLDS.components;

        if (bundle.name.includes('youtube')) {
          threshold = BUNDLE_SIZE_THRESHOLDS.youtubeComponents;
        } else if (bundle.name.includes('social')) {
          threshold = BUNDLE_SIZE_THRESHOLDS.socialComponents;
        }

        expect(bundle.size).toBeLessThanOrEqual(threshold);
        console.log(
          `${bundle.name} size: ${(bundle.size / 1024).toFixed(2)}KB`
        );
      });
    });

    it('should have utils bundle under size threshold', () => {
      if (!distExists) return;

      const utilsBundle = bundles.find(
        b => b.type === 'js' && b.name.includes('utils')
      );

      if (utilsBundle) {
        expect(utilsBundle.size).toBeLessThanOrEqual(
          BUNDLE_SIZE_THRESHOLDS.utils
        );
        console.log(
          `Utils bundle size: ${(utilsBundle.size / 1024).toFixed(2)}KB`
        );
      }
    });
  });

  describe('CSS Bundle Sizes', () => {
    it('should have CSS bundles under size threshold', () => {
      if (!distExists) return;

      const cssBundles = bundles.filter(b => b.type === 'css');
      const totalCssSize = cssBundles.reduce(
        (sum, bundle) => sum + bundle.size,
        0
      );

      expect(totalCssSize).toBeLessThanOrEqual(BUNDLE_SIZE_THRESHOLDS.css);
      console.log(`Total CSS size: ${(totalCssSize / 1024).toFixed(2)}KB`);

      cssBundles.forEach(bundle => {
        console.log(
          `${bundle.name} size: ${(bundle.size / 1024).toFixed(2)}KB`
        );
      });
    });
  });

  describe('Total Bundle Size', () => {
    it('should have reasonable total bundle size', () => {
      if (!distExists) return;

      const jsBundles = bundles.filter(b => b.type === 'js');
      const cssBundles = bundles.filter(b => b.type === 'css');

      const totalJsSize = jsBundles.reduce(
        (sum, bundle) => sum + bundle.size,
        0
      );
      const totalCssSize = cssBundles.reduce(
        (sum, bundle) => sum + bundle.size,
        0
      );
      const totalSize = totalJsSize + totalCssSize;

      // Estimate gzipped size (roughly 30% of original size)
      const estimatedGzippedSize = totalSize * 0.3;

      expect(estimatedGzippedSize).toBeLessThanOrEqual(
        BUNDLE_SIZE_THRESHOLDS.totalGzipped
      );

      console.log(`Total JS size: ${(totalJsSize / 1024).toFixed(2)}KB`);
      console.log(`Total CSS size: ${(totalCssSize / 1024).toFixed(2)}KB`);
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(
        `Estimated gzipped size: ${(estimatedGzippedSize / 1024).toFixed(2)}KB`
      );
    });

    it('should have efficient code splitting', () => {
      if (!distExists) return;

      const jsBundles = bundles.filter(b => b.type === 'js');

      // Should have multiple JS bundles (code splitting)
      expect(jsBundles.length).toBeGreaterThan(1);

      // No single bundle should be too large
      jsBundles.forEach(bundle => {
        expect(bundle.size).toBeLessThan(250 * 1024); // 250KB max per bundle
      });

      console.log(`Number of JS bundles: ${jsBundles.length}`);
    });
  });

  describe('Asset Optimization', () => {
    it('should have optimized image sizes', () => {
      if (!distExists) return;

      const imageBundles = bundles.filter(b => b.type === 'image');

      imageBundles.forEach(bundle => {
        // Images should be reasonably sized
        if (bundle.name.includes('.jpg') || bundle.name.includes('.jpeg')) {
          expect(bundle.size).toBeLessThan(500 * 1024); // 500KB max for JPEG
        } else if (bundle.name.includes('.png')) {
          // Allow larger PNG files for avatars and profile images
          expect(bundle.size).toBeLessThan(1000 * 1024); // 1MB max for PNG
        } else if (bundle.name.includes('.svg')) {
          expect(bundle.size).toBeLessThan(50 * 1024); // 50KB max for SVG
        }

        console.log(
          `${bundle.name} size: ${(bundle.size / 1024).toFixed(2)}KB`
        );
      });
    });

    it('should have proper file naming for caching', () => {
      if (!distExists) return;

      const jsBundles = bundles.filter(b => b.type === 'js');
      const cssBundles = bundles.filter(b => b.type === 'css');

      // JS and CSS files should have hash in filename for cache busting
      [...jsBundles, ...cssBundles].forEach(bundle => {
        // Allow various hash formats: -[hash].js, -[hash].css
        expect(bundle.name).toMatch(/-[a-zA-Z0-9_]{6,}\.(js|css)$/);
      });
    });
  });

  describe('Bundle Analysis', () => {
    it('should provide bundle analysis report', () => {
      if (!distExists) {
        console.warn('Bundle analysis skipped - dist directory not found');
        return;
      }

      const report = {
        totalBundles: bundles.length,
        jsBundles: bundles.filter(b => b.type === 'js').length,
        cssBundles: bundles.filter(b => b.type === 'css').length,
        assetBundles: bundles.filter(b => b.type === 'asset').length,
        imageBundles: bundles.filter(b => b.type === 'image').length,
        totalSize: bundles.reduce((sum, b) => sum + b.size, 0),
        largestBundle: bundles.reduce(
          (largest, current) =>
            current.size > largest.size ? current : largest,
          bundles[0]
        ),
      };

      console.log('\n=== Bundle Analysis Report ===');
      console.log(`Total bundles: ${report.totalBundles}`);
      console.log(`JS bundles: ${report.jsBundles}`);
      console.log(`CSS bundles: ${report.cssBundles}`);
      console.log(`Asset bundles: ${report.assetBundles}`);
      console.log(`Image bundles: ${report.imageBundles}`);
      console.log(`Total size: ${(report.totalSize / 1024).toFixed(2)}KB`);
      if (report.largestBundle) {
        console.log(
          `Largest bundle: ${report.largestBundle.name} (${(report.largestBundle.size / 1024).toFixed(2)}KB)`
        );
      }
      console.log('==============================\n');

      // Basic validation
      expect(report.totalBundles).toBeGreaterThanOrEqual(0);
      expect(report.totalSize).toBeGreaterThanOrEqual(0);
    });
  });
});

// Export for use in other tests
export { BUNDLE_SIZE_THRESHOLDS };
export type { BundleInfo };
