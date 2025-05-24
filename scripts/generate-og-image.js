
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create canvas with social media friendly dimensions (1200x630)
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Brand colors
const deepPurple = "#6D42EF";
const vibrantPink = "#E84393"; 
const warmGold = "#F5B623";
const background = "#1A1A1A"; // Near-black background

// Fill background
ctx.fillStyle = background;
ctx.fillRect(0, 0, width, height);

// Add subtle pattern in background (grid of small dots)
ctx.fillStyle = `${deepPurple}22`; // Very transparent purple
const dotSize = 2;
const spacing = 20;
for (let x = 0; x < width; x += spacing) {
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Add gradient circle in background
const gradient = ctx.createRadialGradient(
  width * 0.7, height * 0.3, 0,
  width * 0.7, height * 0.3, 600
);
gradient.addColorStop(0, `${vibrantPink}33`);
gradient.addColorStop(0.5, `${vibrantPink}11`);
gradient.addColorStop(1, `${vibrantPink}00`);
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Add logo/brand icon (stylized "L" for LearnFlow)
ctx.beginPath();
ctx.moveTo(120, 180);
ctx.lineTo(120, 450);
ctx.lineTo(280, 450);
ctx.lineWidth = 30;
ctx.strokeStyle = deepPurple;
ctx.stroke();

// Add decorative element
ctx.beginPath();
ctx.arc(280, 240, 80, 0, Math.PI * 2);
ctx.fillStyle = warmGold;
ctx.globalAlpha = 0.7;
ctx.fill();
ctx.globalAlpha = 1;

// Add text
ctx.font = "bold 80px Arial";
ctx.fillStyle = "#FFFFFF";
ctx.fillText("LearnFlow", 350, 280);

// Add tagline
ctx.font = "32px Arial";
ctx.fillStyle = vibrantPink;
ctx.fillText("AI-Powered Learning Platform", 350, 340);

// Create buffer
const buffer = canvas.toBuffer('image/png');

// Save to public directory
fs.writeFileSync(path.join(__dirname, '../public/og-image-branded.png'), buffer);
console.log('OG image generated and saved to public/og-image-branded.png');
