# Debugging Vercel 500 FUNCTION_INVOCATION_FAILED Error

## Latest Fixes Applied ✅

### 1. Enhanced Error Logging and Diagnostics
- Added environment variable checks at startup
- Implemented comprehensive module loading with error handling
- Created detailed logging for every step of the request process
- Added stack traces in development mode

### 2. Test Endpoints Created
**Health Check**: `GET /api/health`
- Tests database connection
- Shows environment status
- Returns basic system information

**Analysis Test**: `POST /api/test-analysis`
- Tests URL parsing
- Verifies database access
- Checks Google API key configuration
- Tests all components without running full analysis

**PageSpeed Test**: `POST /api/test-pagespeed`
- Direct test of Google PageSpeed Insights API
- Isolated testing of external API calls
- Detailed error reporting for API failures

### 3. Import Path Resolution
- Switched to dynamic imports with proper error handling
- Added module loading verification
- Isolated import failures from runtime failures

## Step-by-Step Debugging Process

### Step 1: Check Environment Variables in Vercel
Go to your Vercel project dashboard → Settings → Environment Variables

**Required Variables:**
```
DATABASE_URL=postgres://neondb_owner:npg_ogya8M7bGpqS@ep-noisy-tree-advpp9rb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
GOOGLE_PAGESPEED_API_KEY=AIzaSyDzCNdsTvLg7ECyGsWZEzkwmYbHIxoIODo
NODE_ENV=production
VERCEL=1
```

**Verification**: Ensure these are set for **Production**, **Preview**, AND **Development** environments.

### Step 2: Test Health Endpoint
After deployment, test: `GET https://your-app.vercel.app/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "vercel",
  "timestamp": "2025-01-17T..."
}
```

**If this fails**: The issue is with basic environment setup or database connection.

### Step 3: Test Analysis Components
Test: `POST https://your-app.vercel.app/api/test-analysis`
Body: `{"url": "https://example.com"}`

**Expected Response:**
```json
{
  "status": "success",
  "message": "All analysis components working",
  "url_domain": "example.com",
  "api_key_configured": true,
  "database_accessible": true
}
```

**If this fails**: Check the specific error message for component that's failing.

### Step 4: Test PageSpeed API
Test: `POST https://your-app.vercel.app/api/test-pagespeed`
Body: `{"url": "https://example.com"}`

**Expected Response:**
```json
{
  "status": "success",
  "message": "PageSpeed API working",
  "seo_score": 0.85,
  "has_lighthouse_data": true
}
```

**If this fails**: Google API key issue or network connectivity problem.

### Step 5: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions tab
2. Click on the failing function invocation
3. Check the runtime logs for specific error messages

**Look for these log messages:**
- `🔧 Environment check:` - Shows which environment variables are set/missing
- `❌ Module loading failed:` - Import/dependency issues
- `🚀 Handler starting:` - Request processing start
- `✅ All modules loaded successfully` - All imports working
- `✅ Database connection established` - Database working

## Common Error Patterns and Solutions

### Error: "DATABASE_URL not set"
**Solution**: Add DATABASE_URL to Vercel environment variables

### Error: "Module loading failed"
**Solution**: Check that all dependencies are in `dependencies` not `devDependencies` in package.json

### Error: "Google API key not configured"
**Solution**: Add GOOGLE_PAGESPEED_API_KEY to Vercel environment variables

### Error: "Database access failed"
**Solution**: 
- Verify Neon database is accessible
- Check if database URL is correct
- Ensure Neon database allows connections from Vercel

### Error: "PageSpeed API error: 403"
**Solution**: Google API key is invalid or doesn't have PageSpeed Insights API enabled

### Error: "PageSpeed API error: 429"
**Solution**: API rate limit exceeded, wait and retry

## Advanced Troubleshooting

### Check Build Logs
In Vercel Dashboard → Deployments → Click on deployment → View Logs
Look for any build-time errors or warnings.

### Test Database Connection Manually
Use the Neon dashboard or a database client to verify:
1. Database exists and is accessible
2. Tables are created (run `npm run db:push` locally if needed)
3. Connection string is correct

### Verify Google API Key
Test the API key manually:
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

### Check Node.js Version Compatibility
Vercel uses Node.js 18+ by default. Ensure all dependencies are compatible.

## Emergency Fallback
If all else fails, you can temporarily disable the SEO analysis feature by modifying the `/api/analyses` endpoint to return a mock successful response, then gradually re-enable components to isolate the issue.

## Success Indicators
✅ Health endpoint returns status: "healthy"
✅ Test analysis endpoint returns status: "success"  
✅ PageSpeed test endpoint returns status: "success"
✅ No 500 errors in Vercel function logs
✅ Analysis creation works in the frontend