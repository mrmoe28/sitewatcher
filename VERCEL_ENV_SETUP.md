# Vercel Environment Variables Setup

## Required Environment Variables for Production

Copy these exact environment variables to your Vercel project settings:

### Database Configuration
```
DATABASE_URL=postgres://neondb_owner:npg_ogya8M7bGpqS@ep-noisy-tree-advpp9rb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Google API Keys
```
GOOGLE_API_KEY=AIzaSyDzCNdsTvLg7ECyGsWZEzkwmYbHIxoIODo
GOOGLE_PAGESPEED_API_KEY=AIzaSyDzCNdsTvLg7ECyGsWZEzkwmYbHIxoIODo
```

### Session Configuration
```
SESSION_SECRET=sitewatcher-production-secret-key-2025
```

### Stack Auth Configuration
```
NEXT_PUBLIC_STACK_PROJECT_ID=88265e37-e0c5-4043-90de-880c6d2925df
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_d2t2y9fmebht49sj0d37eyrf5jq2hh9n2x59kmh3vxkf8
STACK_SECRET_SERVER_KEY=ssk_pewsw7xctz536w63em2kxcd1jebgfdmpy01gwb8bstq3r
```

### Production Environment
```
NODE_ENV=production
VERCEL=1
```

## How to Set in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above with the exact key-value pairs
4. Set environment for: Production, Preview, Development (all three)
5. Save changes and redeploy

## Verification

After setting these variables, check the Vercel deployment logs to ensure:
- Database connection is established successfully
- Google API key is loaded correctly
- No environment variable errors in the logs

## Database Connection Notes

- The app will automatically use HTTP-based Neon queries in Vercel (no WebSocket issues)
- Connection pooling is limited to 1 connection for serverless compatibility
- Each request creates a fresh database connection