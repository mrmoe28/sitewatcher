import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  History as HistoryIcon, 
  Search, 
  Calendar,
  Eye,
  Download,
  Filter
} from "lucide-react";

// Mock data for demonstration
const mockAnalysisHistory = [
  {
    id: "1",
    url: "https://example.com",
    domain: "example.com",
    date: "2024-01-29",
    time: "14:30",
    seoScore: 85,
    pageSpeed: 92,
    issues: 3,
    status: "completed"
  },
  {
    id: "2",
    url: "https://demo.com/about",
    domain: "demo.com",
    date: "2024-01-28",
    time: "09:15",
    seoScore: 72,
    pageSpeed: 78,
    issues: 8,
    status: "completed"
  },
  {
    id: "3",
    url: "https://test.org",
    domain: "test.org",
    date: "2024-01-27",
    time: "16:45",
    seoScore: 77,
    pageSpeed: 85,
    issues: 5,
    status: "completed"
  },
  {
    id: "4",
    url: "https://example.com/blog",
    domain: "example.com",
    date: "2024-01-26",
    time: "11:20",
    seoScore: 68,
    pageSpeed: 74,
    issues: 12,
    status: "completed"
  },
  {
    id: "5",
    url: "https://newsite.com",
    domain: "newsite.com",
    date: "2024-01-25",
    time: "13:10",
    seoScore: 0,
    pageSpeed: 0,
    issues: 0,
    status: "failed"
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("all");

  const filteredHistory = mockAnalysisHistory.filter(analysis => {
    const matchesSearch = analysis.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
    const matchesSite = siteFilter === "all" || analysis.domain === siteFilter;
    
    return matchesSearch && matchesStatus && matchesSite;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const uniqueSites = [...new Set(mockAnalysisHistory.map(a => a.domain))];

  return (
    <PageLayout 
      title="Analysis History" 
      description="View and manage all your past SEO analyses and performance reports"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
            <CardDescription>
              Find specific analyses using filters and search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by URL or domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {uniqueSites.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Analyses
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockAnalysisHistory.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <HistoryIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockAnalysisHistory.filter(a => a.status === "completed").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg SEO Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      mockAnalysisHistory
                        .filter(a => a.status === "completed" && a.seoScore > 0)
                        .reduce((sum, a) => sum + a.seoScore, 0) /
                      mockAnalysisHistory.filter(a => a.status === "completed" && a.seoScore > 0).length
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockAnalysisHistory.filter(a => a.status === "failed").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Analysis History
            </CardTitle>
            <CardDescription>
              Chronological list of all SEO analyses performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SEO Score</TableHead>
                    <TableHead>Page Speed</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm truncate max-w-xs">
                            {analysis.url}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {analysis.domain}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{analysis.date}</div>
                          <div className="text-gray-500 dark:text-gray-400">{analysis.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(analysis.status)}>
                          {analysis.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {analysis.status === "completed" ? (
                          <span className={`font-medium ${getScoreColor(analysis.seoScore)}`}>
                            {analysis.seoScore}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analysis.status === "completed" ? (
                          <span className={`font-medium ${getScoreColor(analysis.pageSpeed)}`}>
                            {analysis.pageSpeed}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analysis.status === "completed" ? (
                          <Badge variant={analysis.issues <= 5 ? "default" : "destructive"}>
                            {analysis.issues}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {analysis.status === "completed" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-8">
                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No analyses found matching your filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}