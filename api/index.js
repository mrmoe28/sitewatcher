export default function handler(req, res) {
  // Simple health check for now
  if (req.url === '/api/health') {
    return res.status(200).json({ status: 'OK', message: 'SiteInsight API is running' });
  }
  
  // Serve static HTML for the root route
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SiteInsight - SEO Analysis Platform</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            max-width: 800px; 
            margin: 2rem auto; 
            padding: 2rem; 
            background: #f8fafc;
          }
          .container { 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #1e293b; margin-bottom: 1rem; }
          p { color: #64748b; line-height: 1.6; }
          .status { 
            background: #dcfce7; 
            color: #166534; 
            padding: 1rem; 
            border-radius: 4px; 
            margin: 1rem 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔍 SiteInsight</h1>
          <div class="status">✅ Deployment Successful</div>
          <p>Welcome to SiteInsight - your comprehensive SEO analysis and monitoring platform.</p>
          <p>This application helps you analyze websites, track SEO performance, and get optimization recommendations.</p>
          <p><strong>Note:</strong> Full application functionality requires database configuration in Vercel environment variables.</p>
        </div>
      </body>
      </html>
    `);
  }
  
  // Default response for other routes
  res.status(404).json({ error: 'Route not found' });
}