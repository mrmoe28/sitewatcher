import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  BarChart3,
  LineChart,
  PieChart,
  Globe
} from "lucide-react";

// Mock data for demonstration
const mockSites = [
  { id: "1", domain: "example.com", url: "https://example.com" },
  { id: "2", domain: "demo.com", url: "https://demo.com" },
  { id: "3", domain: "test.org", url: "https://test.org" }
];

const mockAnalyticsData = {
  overview: {
    totalSites: 3,
    avgSeoScore: 78,
    avgPageSpeed: 85,
    totalIssues: 12,
    trends: {
      seoScore: 5.2,
      pageSpeed: -2.1,
      issues: -8
    }
  },
  timeSeriesData: [
    { date: "2024-01-01", seoScore: 72, pageSpeed: 88, issues: 15 },
    { date: "2024-01-08", seoScore: 75, pageSpeed: 86, issues: 13 },
    { date: "2024-01-15", seoScore: 78, pageSpeed: 85, issues: 12 },
    { date: "2024-01-22", seoScore: 80, pageSpeed: 87, issues: 10 },
    { date: "2024-01-29", seoScore: 78, pageSpeed: 85, issues: 12 }
  ],
  siteComparison: [
    { site: "example.com", seoScore: 85, pageSpeed: 92, issues: 3 },
    { site: "demo.com", seoScore: 72, pageSpeed: 78, issues: 8 },
    { site: "test.org", seoScore: 77, pageSpeed: 85, issues: 5 }
  ]
};

export default function Analytics() {
  const [selectedSite, setSelectedSite] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/analytics", selectedSite, timeRange],
    queryFn: () => Promise.resolve(mockAnalyticsData), // Mock API call
  });

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    suffix = "" 
  }: {
    title: string;
    value: number;
    trend?: number;
    icon: any;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}{suffix}
            </p>
            {trend && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout 
      title="Analytics Dashboard" 
      description="Comprehensive SEO analytics and performance insights across all your monitored sites"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {mockSites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Sites"
            value={analyticsData?.overview.totalSites || 0}
            icon={Globe}
          />
          <MetricCard
            title="Avg SEO Score"
            value={analyticsData?.overview.avgSeoScore || 0}
            trend={analyticsData?.overview.trends.seoScore}
            icon={TrendingUp}
          />
          <MetricCard
            title="Avg Page Speed"
            value={analyticsData?.overview.avgPageSpeed || 0}
            trend={analyticsData?.overview.trends.pageSpeed}
            icon={BarChart3}
            suffix="/100"
          />
          <MetricCard
            title="Total Issues"
            value={analyticsData?.overview.totalIssues || 0}
            trend={analyticsData?.overview.trends.issues}
            icon={LineChart}
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Over Time
                </CardTitle>
                <CardDescription>
                  Track your SEO performance, page speed, and issues over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This would contain a proper chart component */}
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Chart component would go here (requires chart library)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Site Performance Comparison
                </CardTitle>
                <CardDescription>
                  Compare performance metrics across all your monitored sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.siteComparison.map((site, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{site.site}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">SEO Score</p>
                          <Badge variant={site.seoScore >= 80 ? "default" : site.seoScore >= 60 ? "secondary" : "destructive"}>
                            {site.seoScore}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Page Speed</p>
                          <Badge variant={site.pageSpeed >= 90 ? "default" : site.pageSpeed >= 70 ? "secondary" : "destructive"}>
                            {site.pageSpeed}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Issues</p>
                          <Badge variant={site.issues <= 3 ? "default" : site.issues <= 7 ? "secondary" : "destructive"}>
                            {site.issues}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Top Issues
                  </CardTitle>
                  <CardDescription>
                    Most common SEO issues across your sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { issue: "Missing meta descriptions", count: 5, severity: "high" },
                      { issue: "Slow loading images", count: 3, severity: "medium" },
                      { issue: "Missing alt text", count: 8, severity: "low" },
                      { issue: "Duplicate title tags", count: 2, severity: "high" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.issue}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.severity === "high" ? "destructive" : item.severity === "medium" ? "secondary" : "outline"}>
                            {item.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    AI-powered suggestions to improve your SEO
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Optimize images to improve page speed",
                      "Add schema markup for better search visibility",
                      "Fix missing meta descriptions",
                      "Improve internal linking structure"
                    ].map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}