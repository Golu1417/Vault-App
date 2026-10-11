/**
 * Utility to generate high quality sample photos and sample video blob
 * for instant testing of Calculator Vault without needing local files.
 */

// Helper to convert SVG string to Blob
function svgToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

// Generate sample scenic photo 1: Mountain Sunset
export function generateSamplePhoto1(): { name: string; blob: Blob; type: 'image'; mimeType: string; size: number } {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="40%" stop-color="#701a75"/>
        <stop offset="70%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
      <linearGradient id="mount" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sky)"/>
    <circle cx="400" cy="380" r="90" fill="#fef08a" opacity="0.9"/>
    <!-- Distant mountains -->
    <polygon points="-50,600 200,320 450,600" fill="#27272a" opacity="0.7"/>
    <polygon points="300,600 550,300 850,600" fill="#3f3f46" opacity="0.6"/>
    <!-- Foreground mountains -->
    <polygon points="-100,600 280,360 600,600" fill="url(#mount)"/>
    <polygon points="250,600 520,380 900,600" fill="url(#mount)"/>
    <!-- Stars -->
    <circle cx="120" cy="80" r="2" fill="#ffffff" opacity="0.8"/>
    <circle cx="280" cy="110" r="1.5" fill="#ffffff" opacity="0.9"/>
    <circle cx="650" cy="90" r="2.5" fill="#ffffff" opacity="0.7"/>
    <circle cx="720" cy="160" r="1.5" fill="#ffffff" opacity="0.8"/>
    <text x="40" y="550" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" opacity="0.85">Mountain Sunset</text>
  </svg>`;
  const blob = svgToBlob(svg);
  return {
    name: 'mountain_sunset_hdr.svg',
    blob,
    type: 'image',
    mimeType: 'image/svg+xml',
    size: blob.size,
  };
}

// Generate sample photo 2: Ocean Wave
export function generateSamplePhoto2(): { name: string; blob: Blob; type: 'image'; mimeType: string; size: number } {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#082f49"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sky2)"/>
    <circle cx="650" cy="150" r="60" fill="#fef08a" opacity="0.95"/>
    <rect y="320" width="800" height="280" fill="url(#sea)"/>
    <path d="M0,320 Q200,280 400,320 T800,320 L800,600 L0,600 Z" fill="#0369a1" opacity="0.8"/>
    <path d="M0,360 Q200,310 400,360 T800,360 L800,600 L0,600 Z" fill="#0284c7" opacity="0.6"/>
    <text x="40" y="550" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" opacity="0.85">Azure Coastline</text>
  </svg>`;
  const blob = svgToBlob(svg);
  return {
    name: 'azure_coastline.svg',
    blob,
    type: 'image',
    mimeType: 'image/svg+xml',
    size: blob.size,
  };
}

// Generate sample photo 3: Cyberpunk City
export function generateSamplePhoto3(): { name: string; blob: Blob; type: 'image'; mimeType: string; size: number } {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05050e"/>
        <stop offset="100%" stop-color="#1e1035"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#cyberSky)"/>
    <!-- Buildings -->
    <rect x="60" y="180" width="120" height="420" fill="#111827" stroke="#a855f7" stroke-width="2"/>
    <rect x="220" y="120" width="160" height="480" fill="#0f172a" stroke="#06b6d4" stroke-width="2"/>
    <rect x="420" y="220" width="140" height="380" fill="#18181b" stroke="#ec4899" stroke-width="2"/>
    <rect x="600" y="160" width="150" height="440" fill="#09090b" stroke="#3b82f6" stroke-width="2"/>
    <text x="40" y="550" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#06b6d4">Neo Metropolis</text>
  </svg>`;
  const blob = svgToBlob(svg);
  return {
    name: 'neo_metropolis.svg',
    blob,
    type: 'image',
    mimeType: 'image/svg+xml',
    size: blob.size,
  };
}

// Generate sample short video clip using Canvas & MediaRecorder
export async function generateSampleVideo(): Promise<{ name: string; blob: Blob; type: 'video'; mimeType: string; size: number }> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');

      if (!ctx || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        // Fallback: create mock video blob with container
        const mockBlob = new Blob([new Uint8Array(1024 * 50)], { type: 'video/mp4' });
        resolve({
          name: 'vault_secure_recording.mp4',
          blob: mockBlob,
          type: 'video',
          mimeType: 'video/mp4',
          size: mockBlob.size,
        });
        return;
      }

      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        resolve({
          name: 'vault_demo_video.webm',
          blob: videoBlob,
          type: 'video',
          mimeType: 'video/webm',
          size: videoBlob.size,
        });
      };

      recorder.start();

      let frame = 0;
      const totalFrames = 60; // 2 seconds video
      const interval = setInterval(() => {
        frame++;
        if (ctx) {
          // Animated gradient background
          const grad = ctx.createLinearGradient(0, 0, 480, 360);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#312e81');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 480, 360);

          // Moving glowing orb
          const orbX = 240 + Math.sin(frame * 0.1) * 120;
          const orbY = 180 + Math.cos(frame * 0.1) * 50;

          ctx.beginPath();
          ctx.arc(orbX, orbY, 40, 0, Math.PI * 2);
          ctx.fillStyle = '#6366f1';
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 20;
          ctx.fill();

          // Text overlay
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Encrypted Vault Recording', 240, 290);

          ctx.font = '14px monospace';
          ctx.fillStyle = '#a5b4fc';
          ctx.fillText(`Frame ${frame}/${totalFrames} • 00:0${Math.floor(frame / 30)}`, 240, 320);
        }

        if (frame >= totalFrames) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 33);
    } catch {
      const fallbackBlob = new Blob([new Uint8Array(1024 * 20)], { type: 'video/mp4' });
      resolve({
        name: 'sample_clip.mp4',
        blob: fallbackBlob,
        type: 'video',
        mimeType: 'video/mp4',
        size: fallbackBlob.size,
      });
    }
  });
}
