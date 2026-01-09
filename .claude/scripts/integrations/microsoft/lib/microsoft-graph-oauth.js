#!/usr/bin/env node

/**
 * Microsoft Graph OAuth 2.0 Library
 * Handles OAuth authentication for Outlook/Microsoft Graph API
 *
 * Features:
 * - PKCE flow for public apps (no client secret needed)
 * - Local HTTP server for OAuth callback
 * - AES-256 token encryption at rest
 * - Automatic token refresh
 * - Multi-account management
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { URL } = require('url');

class MicrosoftGraphOAuth {
  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID;
    this.redirectUri = 'http://localhost:3000/callback';
    this.scopes = ['Mail.Read', 'Mail.Send', 'Mail.ReadWrite', 'offline_access'];
    this.tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    this.authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    this.graphEndpoint = 'https://graph.microsoft.com/v1.0';

    // Setup token storage directory
    const rootDir = path.resolve(__dirname, '../../..');
    this.tokensDir = path.join(rootDir, '.claude/data/outlook-tokens');
    this.accountsFile = path.join(this.tokensDir, 'accounts.json');

    // Ensure directories exist
    if (!fs.existsSync(this.tokensDir)) {
      fs.mkdirSync(this.tokensDir, { recursive: true });
    }

    // Get or create encryption key
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Get or create encryption key for token storage
   * Key is stored in .claude/data/outlook-tokens/.encryption-key (gitignored)
   */
  getOrCreateEncryptionKey() {
    const keyFile = path.join(this.tokensDir, '.encryption-key');
    let key;

    if (fs.existsSync(keyFile)) {
      key = fs.readFileSync(keyFile, 'utf8');
    } else {
      // Generate random 32-byte key for AES-256
      key = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(keyFile, key, { mode: 0o600 });
    }

    return key;
  }

  /**
   * Validate that required environment variables are set
   */
  validateSetup() {
    if (!this.clientId) {
      throw new Error(
        'MICROSOFT_CLIENT_ID environment variable not set.\n' +
        'Please set it in .env or .env.local with your Azure App Client ID.'
      );
    }
  }

  /**
   * Generate PKCE code verifier
   */
  generateCodeVerifier() {
    return crypto.randomBytes(32).toString('hex').slice(0, 128);
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  generateCodeChallenge(verifier) {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate random state parameter for CSRF protection
   */
  generateState() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Start local HTTP server to receive OAuth callback
   */
  startLocalServer(codeVerifier, state) {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

        if (parsedUrl.pathname === '/callback') {
          const code = parsedUrl.searchParams.get('code');
          const returnedState = parsedUrl.searchParams.get('state');
          const error = parsedUrl.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end(`Authentication failed: ${error}`);
            server.close();
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (returnedState !== state) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('State mismatch - possible CSRF attack');
            server.close();
            reject(new Error('State parameter mismatch'));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('No authorization code received');
            server.close();
            reject(new Error('No authorization code received'));
            return;
          }

          // Success response
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">' +
            '<h1>✅ Authentication Successful</h1>' +
            '<p>You can close this window and return to the terminal.</p>' +
            '<p>Processing your account...</p>' +
            '</body></html>'
          );

          server.close();
          resolve(code);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
        }
      });

      server.on('error', reject);

      server.listen(3000, 'localhost', () => {
        // Server listening, proceed with opening browser
        resolve(server);
      });

      // Set timeout
      setTimeout(() => {
        server.close();
        reject(new Error('OAuth callback timeout (5 minutes)'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Open browser for OAuth login
   */
  openBrowser(authUrl) {
    return new Promise((resolve) => {
      const commands = [
        `start "${authUrl}"`, // Windows
        `open "${authUrl}"`,  // macOS
        `xdg-open "${authUrl}"` // Linux
      ];

      let executed = false;

      for (const command of commands) {
        exec(command, (error) => {
          if (!executed) {
            executed = true;
            if (!error) {
              resolve();
            } else {
              console.log(`📍 Please open this URL in your browser:\n${authUrl}`);
              resolve();
            }
          }
        });
      }

      // Fallback if no command succeeds
      setTimeout(() => {
        if (!executed) {
          executed = true;
          console.log(`📍 Please open this URL in your browser:\n${authUrl}`);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  exchangeCodeForTokens(code, codeVerifier) {
    return new Promise((resolve, reject) => {
      const data = new URLSearchParams({
        client_id: this.clientId,
        scope: this.scopes.join(' '),
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier
      });

      const options = {
        hostname: 'login.microsoftonline.com',
        path: '/common/oauth2/v2.0/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data.toString())
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);

            if (parsed.error) {
              reject(new Error(`Token exchange failed: ${parsed.error_description || parsed.error}`));
            } else {
              resolve({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token,
                expires_in: parsed.expires_in,
                scope: parsed.scope
              });
            }
          } catch (error) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data.toString());
      req.end();
    });
  }

  /**
   * Get user profile from Microsoft Graph API
   */
  getUserProfile(accessToken) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'graph.microsoft.com',
        path: '/v1.0/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const profile = JSON.parse(data);
            if (profile.error) {
              reject(new Error(`Failed to get user profile: ${profile.error.message}`));
            } else {
              resolve({
                id: profile.id,
                mail: profile.mail || profile.userPrincipalName,
                displayName: profile.displayName
              });
            }
          } catch (error) {
            reject(new Error(`Failed to parse user profile: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Encrypt token using AES-256
   */
  encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt token using AES-256
   */
  decryptToken(encryptedToken) {
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate unique account ID
   */
  generateAccountId() {
    return `acc-${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Load accounts registry
   */
  loadAccountRegistry() {
    if (!fs.existsSync(this.accountsFile)) {
      return { accounts: [], defaultAccount: null };
    }

    try {
      const content = fs.readFileSync(this.accountsFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  Warning: Failed to parse accounts registry: ${error.message}`);
      return { accounts: [], defaultAccount: null };
    }
  }

  /**
   * Save accounts registry
   */
  saveAccountRegistry(registry) {
    fs.writeFileSync(
      this.accountsFile,
      JSON.stringify(registry, null, 2),
      { mode: 0o600 }
    );
  }

  /**
   * Load tokens for account
   */
  loadAccountTokens(accountId) {
    const tokenFile = path.join(this.tokensDir, `${accountId}.json`);

    if (!fs.existsSync(tokenFile)) {
      return null;
    }

    try {
      const content = fs.readFileSync(tokenFile, 'utf8');
      const data = JSON.parse(content);

      // Decrypt tokens
      return {
        ...data,
        accessToken: this.decryptToken(data.accessToken),
        refreshToken: this.decryptToken(data.refreshToken)
      };
    } catch (error) {
      throw new Error(`Failed to load tokens for account ${accountId}: ${error.message}`);
    }
  }

  /**
   * Save tokens for account
   */
  saveAccountTokens(accountId, accountData, tokens) {
    const tokenFile = path.join(this.tokensDir, `${accountId}.json`);

    const data = {
      accountId: accountId,
      alias: accountData.alias,
      email: accountData.email,
      displayName: accountData.displayName || accountData.alias,
      accessToken: this.encryptToken(tokens.access_token),
      refreshToken: this.encryptToken(tokens.refresh_token),
      expiresAt: Date.now() + tokens.expires_in * 1000,
      scopes: tokens.scope ? tokens.scope.split(' ') : this.scopes,
      createdAt: new Date().toISOString(),
      lastRefreshed: new Date().toISOString()
    };

    fs.writeFileSync(tokenFile, JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  /**
   * Start OAuth flow to add new account
   */
  async startAuthFlow(accountAlias) {
    this.validateSetup();

    console.log(`🔐 Adding Outlook Account: ${accountAlias}\n`);
    console.log('1️⃣  Generating authentication request...');

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    const authUrl = new URL(this.authEndpoint);
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('scope', this.scopes.join(' '));
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);

    console.log('2️⃣  Opening browser for authentication...\n');

    // Start server and wait for callback
    const server = await this.startLocalServer(codeVerifier, state);

    // Open browser
    await this.openBrowser(authUrl.toString());

    console.log('⏳ Waiting for authentication...');

    // Get auth code from callback
    let code;
    try {
      code = await new Promise((resolve, reject) => {
        const originalResolve = resolve;
        const wrappedResolve = (val) => {
          server.close();
          originalResolve(val);
        };

        const callbackServer = http.createServer((req, res) => {
          const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

          if (parsedUrl.pathname === '/callback') {
            const returnedCode = parsedUrl.searchParams.get('code');
            const returnedState = parsedUrl.searchParams.get('state');
            const error = parsedUrl.searchParams.get('error');

            if (error) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end(`Authentication failed: ${error}`);
              callbackServer.close();
              reject(new Error(`OAuth error: ${error}`));
              return;
            }

            if (returnedState !== state) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('State mismatch - possible CSRF attack');
              callbackServer.close();
              reject(new Error('State parameter mismatch'));
              return;
            }

            if (!returnedCode) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('No authorization code received');
              callbackServer.close();
              reject(new Error('No authorization code received'));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(
              '<html><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">' +
              '<h1>✅ Authentication Successful</h1>' +
              '<p>You can close this window and return to the terminal.</p>' +
              '</body></html>'
            );

            callbackServer.close();
            wrappedResolve(returnedCode);
          }
        });

        callbackServer.listen(3000, 'localhost');
        callbackServer.on('error', reject);
      });
    } catch (error) {
      throw error;
    }

    console.log('3️⃣  Exchanging code for access token...');

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);

    console.log('4️⃣  Retrieving account information...');

    // Get user profile
    const userProfile = await this.getUserProfile(tokens.access_token);

    console.log('5️⃣  Saving account credentials...\n');

    // Generate account ID
    const accountId = this.generateAccountId();

    // Save tokens
    this.saveAccountTokens(accountId, {
      alias: accountAlias,
      email: userProfile.mail,
      displayName: userProfile.displayName
    }, tokens);

    // Update registry
    const registry = this.loadAccountRegistry();
    registry.accounts.push({
      id: accountId,
      alias: accountAlias,
      email: userProfile.mail,
      displayName: userProfile.displayName,
      createdAt: new Date().toISOString()
    });

    if (!registry.defaultAccount) {
      registry.defaultAccount = accountId;
    }

    this.saveAccountRegistry(registry);

    return {
      accountId: accountId,
      alias: accountAlias,
      email: userProfile.mail,
      displayName: userProfile.displayName
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(accountId) {
    this.validateSetup();

    const tokens = this.loadAccountTokens(accountId);
    if (!tokens) {
      throw new Error(`Account not found: ${accountId}`);
    }

    const data = new URLSearchParams({
      client_id: this.clientId,
      scope: this.scopes.join(' '),
      refresh_token: tokens.refreshToken,
      grant_type: 'refresh_token'
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'login.microsoftonline.com',
        path: '/common/oauth2/v2.0/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data.toString())
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);

            if (parsed.error) {
              reject(new Error(`Token refresh failed: ${parsed.error_description || parsed.error}`));
            } else {
              // Update tokens
              tokens.accessToken = parsed.access_token;
              if (parsed.refresh_token) {
                tokens.refreshToken = parsed.refresh_token;
              }
              tokens.expiresAt = Date.now() + parsed.expires_in * 1000;
              tokens.lastRefreshed = new Date().toISOString();

              // Save updated tokens
              const tokenFile = path.join(this.tokensDir, `${accountId}.json`);
              fs.writeFileSync(tokenFile, JSON.stringify({
                ...tokens,
                accessToken: this.encryptToken(tokens.accessToken),
                refreshToken: this.encryptToken(tokens.refreshToken)
              }, null, 2), { mode: 0o600 });

              resolve(tokens.accessToken);
            }
          } catch (error) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data.toString());
      req.end();
    });
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidToken(accountId) {
    const tokens = this.loadAccountTokens(accountId);
    if (!tokens) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Check if token is expired or expiring soon (within 5 minutes)
    if (Date.now() + 5 * 60 * 1000 > tokens.expiresAt) {
      console.log('🔄 Refreshing access token...');
      return await this.refreshAccessToken(accountId);
    }

    return tokens.accessToken;
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(accountId) {
    const tokens = this.loadAccountTokens(accountId);
    if (!tokens) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Delete token file
    const tokenFile = path.join(this.tokensDir, `${accountId}.json`);
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }

    // Remove from registry
    const registry = this.loadAccountRegistry();
    registry.accounts = registry.accounts.filter((acc) => acc.id !== accountId);

    if (registry.defaultAccount === accountId) {
      registry.defaultAccount = registry.accounts.length > 0 ? registry.accounts[0].id : null;
    }

    this.saveAccountRegistry(registry);
  }

  /**
   * Get account info by alias
   */
  getAccountByAlias(alias) {
    const registry = this.loadAccountRegistry();
    return registry.accounts.find((acc) => acc.alias === alias);
  }

  /**
   * Get account info by ID
   */
  getAccountById(accountId) {
    const registry = this.loadAccountRegistry();
    return registry.accounts.find((acc) => acc.id === accountId);
  }

  /**
   * Get default account
   */
  getDefaultAccount() {
    const registry = this.loadAccountRegistry();
    if (!registry.defaultAccount) {
      return null;
    }
    return this.getAccountById(registry.defaultAccount);
  }

  /**
   * Set default account
   */
  setDefaultAccount(accountId) {
    const registry = this.loadAccountRegistry();
    const account = registry.accounts.find((acc) => acc.id === accountId);

    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    registry.defaultAccount = accountId;
    this.saveAccountRegistry(registry);
  }

  /**
   * List all accounts
   */
  listAccounts() {
    const registry = this.loadAccountRegistry();
    return {
      accounts: registry.accounts,
      defaultAccount: registry.defaultAccount
    };
  }
}

module.exports = MicrosoftGraphOAuth;
