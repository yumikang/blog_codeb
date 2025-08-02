import { useEffect, useRef } from 'react';
import { useLocation } from '@remix-run/react';

// Track loaded scripts globally to prevent duplicate loading
const loadedScripts = new Set<string>();
const scriptLoadPromises = new Map<string, Promise<void>>();

// Define script groups based on priority and route needs
const scriptGroups = {
  critical: [
    '/js/vendors/jquery-3.7.1.min.js', // Many scripts depend on jQuery
  ],
  ui: [
    '/js/vendors/swiper-bundle.min.js',
    '/js/vendors/aos.js',
    '/js/vendors/jquery.magnific-popup.min.js',
  ],
  animation: [
    '/js/vendors/gsap.min.js',
    '/js/vendors/ScrollTrigger.min.js',
    '/js/vendors/ScrollToPlugin.min.js',
    '/js/vendors/Splitetext.js',
    '/js/vendors/wow.min.js',
  ],
  misc: [
    '/js/vendors/jquery.carouselTicker.min.js',
    '/js/vendors/jquery.odometer.min.js',
    '/js/vendors/jquery.appear.js',
    '/js/vendors/howler.min.js',
    '/js/vendors/headhesive.min.js',
    '/js/vendors/smart-stick-nav.js',
    '/js/vendors/image-hover-effects.js',
  ],
  main: [
    '/js/gsap-custom.js',
    '/js/main.js',
  ],
};

export function ClientScripts() {
  const hasInitialized = useRef(false);
  const location = useLocation();
  
  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    
    // Add preloader to DOM only if it doesn't exist
    if (!document.getElementById('preloader')) {
      const preloader = document.createElement('div');
      preloader.id = 'preloader';
      preloader.innerHTML = `
        <div id="loader" class="loader">
          <div class="loader-container">
            <div class="loader-icon">
              <img src="/imgs/template/logo/logo-gradient.svg" alt="Preloader" />
            </div>
          </div>
        </div>
      `;
      document.body.insertBefore(preloader, document.body.firstChild);
    }
    // Load scripts only on client side after hydration
    const loadScript = (src: string): Promise<void> => {
      // Return existing promise if script is already loading
      if (scriptLoadPromises.has(src)) {
        return scriptLoadPromises.get(src)!;
      }
      
      // Skip if already loaded
      if (loadedScripts.has(src)) {
        return Promise.resolve();
      }
      
      const promise = new Promise<void>((resolve, reject) => {
        // Check if script already exists in DOM
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          loadedScripts.add(src);
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loadedScripts.add(src);
          scriptLoadPromises.delete(src);
          resolve();
        };
        script.onerror = (error) => {
          scriptLoadPromises.delete(src);
          reject(error);
        };
        document.body.appendChild(script);
      });
      
      scriptLoadPromises.set(src, promise);
      return promise;
    };

    // Determine which scripts to load based on route
    const getScriptsForRoute = () => {
      const path = location.pathname;
      const scriptsToLoad: string[] = [];
      
      // Always load critical scripts
      scriptsToLoad.push(...scriptGroups.critical);
      
      // Homepage needs all scripts
      if (path === '/') {
        scriptsToLoad.push(...scriptGroups.ui, ...scriptGroups.animation, ...scriptGroups.misc);
      }
      // Blog post pages need UI scripts
      else if (path.includes('/') && path.split('/').length > 2) {
        scriptsToLoad.push(...scriptGroups.ui);
      }
      // Category pages need basic UI
      else if (path.includes('/categories') || path.includes('/latest')) {
        scriptsToLoad.push(...scriptGroups.ui);
      }
      // Admin pages don't need any fancy scripts
      else if (path.includes('/admin')) {
        // Skip loading unnecessary scripts
        return [...scriptGroups.critical, ...scriptGroups.main];
      }
      
      // Always load main scripts last
      scriptsToLoad.push(...scriptGroups.main);
      
      return scriptsToLoad;
    };

    const loadScripts = async () => {
      try {
        const scriptsToLoad = getScriptsForRoute();
        
        // Load scripts in sequence based on dependencies
        for (const src of scriptsToLoad) {
          try {
            await loadScript(src);
          } catch (error) {
            console.warn(`Failed to load script: ${src}`, error);
            // Continue loading other scripts even if one fails
          }
        }
        
        // Scripts will initialize themselves
        // AOS is initialized in main.js
        // WOW is initialized in main.js or gsap-custom.js
        
        // Remove preloader after scripts are loaded
        const preloader = document.getElementById('preloader');
        if (preloader) {
          setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
              preloader.style.display = 'none';
            }, 300);
          }, 100);
        }
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return null;
}

// Type declarations for window object
declare global {
  interface Window {
    AOS: any;
    WOW: any;
    jQuery: any;
    $: any;
  }
}