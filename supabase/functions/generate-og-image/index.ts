
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=604800, immutable', // Cache for 1 week
};

// Generate SVG image with LearnFlow branding
function generateSVGImage() {
  // Brand colors
  const deepPurple = "#6D42EF";
  const vibrantPink = "#E84393"; 
  const warmGold = "#F5B623";
  const background = "#1A1A1A"; // Near-black background
  
  // SVG image with branding elements
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1200" height="630" fill="${background}" />
    
    <!-- Background pattern - dots -->
    <g fill="${deepPurple}" opacity="0.15">
      ${Array(30).fill(0).map((_, i) => 
        Array(15).fill(0).map((_, j) => 
          `<circle cx="${i * 40 + 20}" cy="${j * 40 + 20}" r="2" />`
        ).join('')
      ).join('')}
    </g>
    
    <!-- Gradient circle -->
    <circle cx="840" cy="200" r="300" fill="url(#gradientPink)" />
    
    <!-- Stylized "L" for LearnFlow -->
    <path d="M120,180 L120,450 L280,450" stroke="${deepPurple}" stroke-width="30" fill="none" />
    
    <!-- Decorative element -->
    <circle cx="280" cy="240" r="80" fill="${warmGold}" opacity="0.7" />
    
    <!-- Text content -->
    <text x="350" y="280" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#FFFFFF">LearnFlow</text>
    <text x="350" y="340" font-family="Arial, sans-serif" font-size="32" fill="${vibrantPink}">AI-Powered Learning Platform</text>
    
    <!-- Definitions -->
    <defs>
      <radialGradient id="gradientPink" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="${vibrantPink}" stop-opacity="0.2" />
        <stop offset="50%" stop-color="${vibrantPink}" stop-opacity="0.07" />
        <stop offset="100%" stop-color="${vibrantPink}" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate SVG image
    const svgContent = generateSVGImage();
    const svgBytes = new TextEncoder().encode(svgContent);

    // Return the SVG image
    return new Response(svgBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate image" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
