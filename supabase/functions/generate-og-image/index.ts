
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=604800, immutable', // Cache for 1 week
};

// Generate SVG image with LearnFlow branding
function generateSVGImage() {
  // Brand colors
  const brandPurple = "#6654f5";
  const brandPink = "#ca5a8b";
  const brandGold = "#f2b347";
  const brandBlack = "#0b0c18";

  // SVG image with branding elements
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${brandPurple}" />
        <stop offset="50%" stop-color="${brandPink}" />
        <stop offset="100%" stop-color="${brandGold}" />
      </linearGradient>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${brandPurple}" stop-opacity="0.15" />
        <stop offset="50%" stop-color="${brandPink}" stop-opacity="0.1" />
        <stop offset="100%" stop-color="${brandGold}" stop-opacity="0.05" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="${brandBlack}" />
    <rect width="1200" height="630" fill="url(#bgGradient)" />

    <!-- Large branded "L" -->
    <text x="100" y="520" font-family="Poppins, Arial, sans-serif" font-size="480" font-weight="700"
          fill="url(#brandGradient)" opacity="0.2">L</text>

    <!-- Main content -->
    <g>
      <text x="100" y="240" font-family="Poppins, Arial, sans-serif" font-size="92" font-weight="700"
            fill="url(#brandGradient)">LearnFlow</text>
      <text x="100" y="310" font-family="Poppins, Arial, sans-serif" font-size="38" font-weight="400"
            fill="#FFFFFF" opacity="0.9">Personalized Learning Paths</text>
      <text x="100" y="380" font-family="Poppins, Arial, sans-serif" font-size="28" font-weight="300"
            fill="#FFFFFF" opacity="0.7">Master any topic at your own pace</text>
    </g>

    <!-- Decorative gradient orbs -->
    <circle cx="950" cy="150" r="120" fill="${brandPurple}" opacity="0.3" />
    <circle cx="1050" cy="480" r="80" fill="${brandPink}" opacity="0.25" />
    <circle cx="850" cy="520" r="60" fill="${brandGold}" opacity="0.2" />
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
