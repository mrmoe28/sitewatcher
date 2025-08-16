# Vercel Environment Variables

## Required Environment Variables for Production Deployment

### Database Configuration (Neon)
```
DATABASE_URL=postgres://neondb_owner:npg_ogya8M7bGpqS@ep-noisy-tree-advpp9rb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgres://neondb_owner:npg_ogya8M7bGpqS@ep-noisy-tree-advpp9rb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_ogya8M7bGpqS@ep-noisy-tree-advpp9rb.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-noisy-tree-advpp9rb-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=npg_ogya8M7bGpqS
POSTGRES_DATABASE=neondb
```

### Google APIs
```
GOOGLE_API_KEY=AIzaSyDzCNdsTvLg7ECyGsWZEzkwmYbHIxoIODo
```

### Session Configuration
```
SESSION_SECRET=sitewatcher-production-secret-key-2025
```

### Stack Auth (Neon Auth Integration)
```
NEXT_PUBLIC_STACK_PROJECT_ID=88265e37-e0c5-4043-90de-880c6d2925df
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_d2t2y9fmebht49sj0d37eyrf5jq2hh9n2x59kmh3vxkf8
STACK_SECRET_SERVER_KEY=ssk_pewsw7xctz536w63em2kxcd1jebgfdmpy01gwb8bstq3r
```

### Runtime Configuration
```
NODE_ENV=production
```

## Setup Instructions

1. **Vercel Dashboard Setup:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add each variable above with the corresponding value

2. **Database Verification:**
   - Database schema has been successfully pushed to Neon
   - All tables created: users, sites, analyses, recommendations, keywords
   - Connection tested and verified working

3. **API Integrations:**
   - Google PageSpeed Insights API configured for SEO analysis
   - Stack Auth configured for user authentication
   - Neon serverless PostgreSQL for data persistence

## Database Schema Overview

### Tables Created:
- **users** - User authentication and management
- **sites** - Tracked websites and domains
- **analyses** - SEO analysis results with scores and status
- **recommendations** - AI-generated SEO improvement suggestions
- **keywords** - Keyword ranking tracking and performance

### Key Features Supported:
- User registration and authentication
- Multi-site SEO monitoring
- Real-time analysis progress tracking
- Historical performance data
- Keyword ranking trends
- Interactive charts and analytics
- CSV export functionality

## Production Deployment Ready! 🚀

The application is now fully configured for production deployment with:
- ✅ Neon serverless PostgreSQL database
- ✅ Complete schema with all required tables
- ✅ Google PageSpeed Insights API integration
- ✅ Stack Auth for user management
- ✅ Comprehensive charts library
- ✅ All environment variables configured