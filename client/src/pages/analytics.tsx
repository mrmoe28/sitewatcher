import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MultiProgress } from "@/components/ui/multi-progress";
import { AnalyticsOverviewSkeleton, ChartSkeleton } from "@/components/ui/skeleton-loaders";
import { useProgress, OPERATION_TEMPLATES } from "@/hooks/use-progress";
import { useQuery } from "@tanstack/react-query";
import { PerformanceLineChart } from "@/components/charts/performance-line-chart";
import { SiteComparisonChart } from "@/components/charts/site-comparison-chart";
import { MiniSparkline } from "@/components/charts/mini-sparkline";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  RefreshCw
} from "lucide-react";


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
    },
    sparklines: {
      seoScore: [
        { value: 72 }, { value: 75 }, { value: 78 }, { value: 80 }, { value: 78 }
      ],
      pageSpeed: [
        { value: 88 }, { value: 86 }, { value: 85 }, { value: 87 }, { value: 85 }
      ],
      issues: [
        { value: 15 }, { value: 13 }, { value: 12 }, { value: 10 }, { value: 12 }
      ]
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    createOperation,
    startOperation,
    cancelOperation,
    getOperation,
    getActiveOperations
  } = useProgress();

  // Fetch real sites from API
  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics", selectedSite, timeRange],
    queryFn: () => {
      // Simulate API delay for demonstration
      return new Promise(resolve => {
        setTimeout(() => resolve(mockAnalyticsData), 1500);
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activeOperations = getActiveOperations();
  const refreshOperation = activeOperations.find(op => op.type === "analytics-aggregation");
  const exportOperation = activeOperations.find(op => op.type === "analytics-export");

  const handleRefreshAnalytics = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    const operationId = createOperation(
      "analytics-aggregation",
      OPERATION_TEMPLATES["analytics-aggregation"].title,
      OPERATION_TEMPLATES["analytics-aggregation"].stages
    );
    
    startOperation(operationId);
    
    // Simulate the refresh process
    setTimeout(() => {
      refetch();
      setIsRefreshing(false);
    }, 8000); // 8 seconds to complete the simulated operation
  };

  const handleExportReport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    const operationId = createOperation(
      "analytics-export",
      OPERATION_TEMPLATES["analytics-export"].title,
      OPERATION_TEMPLATES["analytics-export"].stages
    );
    
    startOperation(operationId);
    
    // Simulate export process
    setTimeout(() => {
      // Simulate file download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Analytics Report Data...';
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      setIsExporting(false);
    }, 6000); // 6 seconds for export
  };

  // Show loading skeleton while data is being fetched initially
  if (isLoading && !analyticsData) {
    return (
      <PageLayout 
        title="Analytics Dashboard" 
        description="Comprehensive SEO analytics and performance insights across all your monitored sites"
      >
        <AnalyticsOverviewSkeleton />
      </PageLayout>
    );
  }

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    suffix = "",
    sparklineData
  }: {
    title: string;
    value: number;
    trend?: number;
    icon: any;
    suffix?: string;
    sparklineData?: Array<{ value: number }>;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
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
        {sparklineData && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Last 5 periods</span>
            <MiniSparkline 
              data={sparklineData}
              color={trend && trend > 0 ? "hsl(142, 76%, 36%)" : trend && trend < 0 ? "hsl(0, 84%, 60%)" : "hsl(var(--primary))"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <PageLayout 
      title="Analytics Dashboard" 
      description="Comprehensive SEO analytics and performance insights across all your monitored sites"
    >
      <div className="space-y-6">
        {/* Progress Indicators */}
        {refreshOperation && (
          <MultiProgress
            title={refreshOperation.title}
            stages={refreshOperation.stages}
            currentStage={refreshOperation.currentStage}
            overallProgress={refreshOperation.overallProgress}
            canCancel={refreshOperation.canCancel}
            onCancel={() => {
              cancelOperation(refreshOperation.id);
              setIsRefreshing(false);
            }}
          />
        )}

        {exportOperation && (
          <MultiProgress
            title={exportOperation.title}
            stages={exportOperation.stages}
            currentStage={exportOperation.currentStage}
            overallProgress={exportOperation.overallProgress}
            canCancel={exportOperation.canCancel}
            onCancel={() => {
              cancelOperation(exportOperation.id);
              setIsExporting(false);
            }}
            compact
          />
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
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

          <Button 
            variant="outline" 
            onClick={handleRefreshAnalytics}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
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
            sparklineData={analyticsData?.overview.sparklines.seoScore}
          />
          <MetricCard
            title="Avg Page Speed"
            value={analyticsData?.overview.avgPageSpeed || 0}
            trend={analyticsData?.overview.trends.pageSpeed}
            icon={BarChart3}
            suffix="/100"
            sparklineData={analyticsData?.overview.sparklines.pageSpeed}
          />
          <MetricCard
            title="Total Issues"
            value={analyticsData?.overview.totalIssues || 0}
            trend={analyticsData?.overview.trends.issues}
            icon={LineChart}
            sparklineData={analyticsData?.overview.sparklines.issues}
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
            <PerformanceLineChart
              data={analyticsData?.timeSeriesData || []}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onExport={() => {
                // Create CSV download for performance data
                const csvData = analyticsData?.timeSeriesData.map(point => 
                  `${point.date},${point.seoScore},${point.pageSpeed},${point.issues}`
                ).join('\n');
                const link = document.createElement('a');
                link.href = `data:text/csv;charset=utf-8,Date,SEO Score,Page Speed,Issues\n${csvData}`;
                link.download = `performance-trends-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <SiteComparisonChart
              data={analyticsData?.siteComparison || []}
              onExport={() => {
                // Create CSV download for comparison data
                const csvData = analyticsData?.siteComparison.map(site => 
                  `${site.site},${site.seoScore},${site.pageSpeed},${site.issues}`
                ).join('\n');
                const link = document.createElement('a');
                link.href = `data:text/csv;charset=utf-8,Site,SEO Score,Page Speed,Issues\n${csvData}`;
                link.download = `site-comparison-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
              onSiteClick={(site) => {
                // Navigate to individual site analytics page
                console.log('Navigate to site details:', site);
              }}
            />
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