#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const logoPath = path.resolve(__dirname, '../../branding/logos/logo_long_white_colour.png');
const buffer = fs.readFileSync(logoPath);
const base64 = buffer.toString('base64');
const dataUri = `data:image/png;base64,${base64}`;

console.log(dataUri);
