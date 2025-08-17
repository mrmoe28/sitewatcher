import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Key, 
  Plus, 
  TrendingUp,
  Search,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function Keywords() {
  const [selectedSite, setSelectedSite] = useState("all");
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  // Fetch real sites from API
  const { data: sites = [] } = useQuery({
    queryKey: ["/sites"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // In the future, this would fetch real keyword data
  // For now, we show an empty state that guides users to real functionality
  const keywords = []; // Real keywords would come from API

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a keyword to track",
        variant: "destructive",
      });
      return;
    }

    // This would integrate with a real keyword tracking API
    toast({
      title: "Coming Soon",
      description: "Keyword tracking will be available once integrated with ranking APIs",
    });
    setNewKeyword("");
  };

  // Enhanced keyword ranking trends chart component
  const KeywordTrendsChart = () => (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Keyword Ranking Trends
            </CardTitle>
            <CardDescription className="mt-1">
              Track ranking position changes over time
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="text-center space-y-3">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No keyword data available
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add keywords and run SEO analyses to see ranking trends
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout 
      title="Keyword Tracking" 
      description="Monitor your keyword rankings and search performance across all your sites"
    >
      <div className="space-y-6">
        {/* Add New Keyword */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Keyword
            </CardTitle>
            <CardDescription>
              Track a new keyword's ranking performance across your monitored sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter keyword to track (e.g., 'SEO analysis')"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                />
              </div>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-48">
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
              <Button onClick={handleAddKeyword} className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Keywords
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg Position
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    -
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Volume
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Trends Chart */}
        <KeywordTrendsChart />

        {/* Getting Started Guide */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Lightbulb className="h-5 w-5" />
              Getting Started with Keyword Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Add your websites for monitoring
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Start by adding the websites you want to track using the "Add Site" feature
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Run SEO analyses
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Perform SEO analyses to get baseline metrics and identify optimization opportunities
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Track keyword rankings
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Add keywords to monitor their ranking positions and track improvements over time
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
              <Button 
                onClick={() => window.location.href = '/add-site'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Your First Site
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}