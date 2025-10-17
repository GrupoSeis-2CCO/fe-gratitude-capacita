import React from 'react';
import { api } from '../services/api.js';

export default function SmartImage({ src, alt = '', className = '', style = {}, fallback = '/default-course-icon.svg' }) {
  const original = src;
  const [resolvedSrc, setResolvedSrc] = React.useState(() => resolveSrc(original));
  const [triedProxy, setTriedProxy] = React.useState(false);

  React.useEffect(() => {
    setTriedProxy(false);
    setResolvedSrc(resolveSrc(original));
  }, [original]);

  function isString(v) { return typeof v === 'string' && v.length > 0; }

  function normalizeUploadsPath(input) {
    if (!isString(input)) return null;
    if (input.startsWith('/uploads')) return `${api.defaults.baseURL}${input}`;
    if (input.startsWith('uploads/')) return `${api.defaults.baseURL}/${input}`;
    return null;
  }

  function extractGoogleImgres(input) {
    try {
      const url = new URL(input);
      if (url.hostname.includes('google.') && url.pathname.includes('imgres')) {
        const real = url.searchParams.get('imgurl') || url.searchParams.get('imgrefurl');
        if (real) return decodeURIComponent(real);
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  function transformDriveLink(input) {
    try {
      const url = new URL(input);
      if (url.hostname.includes('drive.google.com')) {
        const m = url.pathname.match(/\/file\/d\/([^/]+)\//);
        if (m && m[1]) {
          return `https://drive.google.com/uc?export=view&id=${m[1]}`;
        }
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  function buildProxyUrl(input) {
    // Fallback to a same-origin proxy to avoid browser OpaqueResponseBlocking
    const enc = encodeURIComponent(input);
    return `${api.defaults.baseURL}/proxy/image?url=${enc}`;
  }

  function resolveSrc(input) {
    if (!input) return fallback;
    if (!isString(input)) return fallback;

    // Local object URL (file preview)
    if (input.startsWith('blob:')) return input;
    // Data URL (not allowed for save, but fine for preview)
    if (input.startsWith('data:')) return input;

    // Backend served path
    const uploads = normalizeUploadsPath(input);
    if (uploads) return uploads;

    // Try to decode common Google redirector links (imgres)
    const imgres = extractGoogleImgres(input);
    if (imgres) return imgres;

    // Handle Google Drive share links
    const drive = transformDriveLink(input);
    if (drive) return drive;

    // For absolute remote images, prefer using our proxy to avoid CORS/ORB blocks
    if (/^https?:\/\//i.test(input)) {
      return buildProxyUrl(input);
    }

    // Otherwise, return as-is (relative to frontend or backend base)
    return input;
  }

  function handleError(e) {
    // If loading a remote http(s) image failed due to cross-site restrictions,
    // try routing via our backend proxy once before falling back.
    const current = e.currentTarget.src;
    if (!triedProxy && isString(original) && /^https?:\/\//i.test(original)) {
      setTriedProxy(true);
      setResolvedSrc(buildProxyUrl(original));
      return;
    }
    e.currentTarget.src = fallback;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={handleError}
    />
  );
}
