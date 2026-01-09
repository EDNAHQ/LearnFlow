#!/usr/bin/env node

/**
 * Send Blog Posts via Email
 * Creates blog content and sends via enterprise-dna-email.html template
 *
 * Usage:
 *   node send-blog.js --blog skills-revolution --to sam.mckay@enterprisedna.co.nz
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].substring(2);
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    options[key] = value;
    if (value !== true) i++;
  }
}

// Blog definitions
const blogs = {
  'skills-revolution': {
    subject: 'The Skills Revolution: How Claude\'s Modular Architecture is Replacing Purchased Software',
    html: `<html><body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; color: #333; background-color: #f9f9f9;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 0;"><tr><td align="center" style="padding: 0;"><table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"><tr><td align="center" style="padding: 40px 20px 30px 20px; background-color: #0b0c18;"><img src="{{LOGO}}" alt="Enterprise DNA" style="max-width: 160px; height: auto; display: block;" /></td></tr><tr><td style="padding: 40px 30px;"><h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">The Skills Revolution</h1><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">How Claude's modular architecture is replacing purchased software</p><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">We're witnessing a quiet shift in how software gets built. For decades, if you needed a specific capability—content generation, image creation, web research, email automation—you bought a tool. Expensive tools. Point solutions that did one thing well and integrated poorly with everything else.</p><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;"><strong style="color: #6654f5;">That model is changing.</strong></p><h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 600; color: #000;">Skills + APIs — The New Composable Model</h2><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">Claude's skills framework combined with APIs is creating something fundamentally different. It's the first genuinely composable, modular approach to software capabilities I've seen work at scale.</p><hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 24px 0;"/><h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 600; color: #000;">The Old Model: Buy, Integrate, Maintain</h2><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">You need email automation? Buy Mailgun or SendGrid. Image generation? Replicate or DALL-E API. Web research? Tavily or Perplexity. Each tool comes with its own API, pricing model, authentication scheme, rate limits, and failure modes.</p><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">Result: A Frankenstein stack of five different vendors, five different authentication methods, five different error handling patterns. Your costs multiply. Your maintenance surface area explodes.</p><hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 24px 0;"/><h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 600; color: #000;">The New Model: Compose, Script, Control</h2><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">Instead, we write skills. One modular piece that orchestrates multiple APIs through a simple abstraction. The skill is testable, versionable, and can be composed with other skills. Same capabilities. Fraction of the cost. Complete control.</p><p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #555;"><strong>Key benefits:</strong></p><ul style="margin: 16px 0; padding-left: 20px; color: #555; font-size: 14px;"><li style="margin-bottom: 8px;">Economics shift from vendor lock-in to capability lock-in</li><li style="margin-bottom: 8px;">Integration friction disappears</li><li style="margin-bottom: 8px;">Specialization without fragmentation</li><li style="margin-bottom: 8px;">Maintenance shifts from reactive to proactive</li><li style="margin-bottom: 8px;">You can build things that shouldn't exist as products</li></ul><hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 24px 0;"/><h2 style="margin: 24px 0 12px 0; font-size: 18px; font-weight: 600; color: #000;">What This Means</h2><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #555;">This is bigger than automation. It's a fundamental shift in how software capabilities distribute. Power distributes to the people building the skills, not the people selling the platform.</p><p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555;">The software that used to require a consultant, platform subscription, team maintenance, and fear of vendor changes now requires 50 lines of code, an API key, and the confidence that you own it.</p></td></tr><tr><td style="padding: 0 30px;"><div style="height: 1px; background-color: #e0e0e0;"></div></td></tr><tr><td style="padding: 24px 30px; background-color: #fafafa; border-radius: 0 0 8px 8px;"><p style="margin: 0 0 12px 0; font-size: 12px; color: #999; line-height: 1.5;">Enterprise DNA  •  Making automation accessible to everyone</p><p style="margin: 0; font-size: 11px; color: #bbb; line-height: 1.5;"><a href="#" style="color: #6654f5; text-decoration: none;">Manage preferences</a> • <a href="#" style="color: #6654f5; text-decoration: none;">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`
  }
};

if (!options.blog || !blogs[options.blog]) {
  console.error('❌ Error: Must specify --blog with valid blog name');
  console.error('   Available blogs:', Object.keys(blogs).join(', '));
  process.exit(1);
}

if (!options.to) {
  console.error('❌ Error: Must provide --to email address');
  process.exit(1);
}

const blogData = blogs[options.blog];

// Call send-email.js with the blog content
const sendEmailPath = path.resolve(__dirname, './send-email.js');
const emailArgs = [
  sendEmailPath,
  '--to',
  options.to,
  '--subject',
  blogData.subject,
  '--html',
  blogData.html
];

if (options.verbose) {
  emailArgs.push('--verbose');
}

const child = spawn('node', emailArgs, { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});
