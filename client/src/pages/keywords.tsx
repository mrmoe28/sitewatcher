import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Eye,
  Target
} from "lucide-react";

// Mock data for demonstration
const mockKeywords = [
  {
    id: "1",
    term: "SEO analysis",
    rank: 5,
    previousRank: 8,
    volume: 2900,
    difficulty: "medium",
    site: "example.com"
  },
  {
    id: "2",
    term: "website optimization",
    rank: 12,
    previousRank: 15,
    volume: 1800,
    difficulty: "high",
    site: "example.com"
  },
  {
    id: "3",
    term: "page speed test",
    rank: 3,
    previousRank: 3,
    volume: 5400,
    difficulty: "low",
    site: "demo.com"
  },
  {
    id: "4",
    term: "meta tags optimization",
    rank: 18,
    previousRank: 12,
    volume: 890,
    difficulty: "medium",
    site: "test.org"
  }
];

export default function Keywords() {
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setIsAdding(true);
    try {
      // Here we would call the API to add the keyword
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Keyword Added",
        description: `"${newKeyword}" has been added to your tracking list`,
      });
      
      setNewKeyword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add keyword. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  const getRankTrend = (current: number, previous: number) => {
    if (current < previous) return { trend: "up", change: previous - current };
    if (current > previous) return { trend: "down", change: current - previous };
    return { trend: "same", change: 0 };
  };

  return (
    <PageLayout 
      title="Keyword Tracking" 
      description="Monitor your keyword rankings and search performance across all your sites"
    >
      <div className="space-y-6">
        {/* Add Keyword Form */}
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
            <form onSubmit={handleAddKeyword} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter keyword to track (e.g., 'SEO analysis')"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  disabled={isAdding}
                />
              </div>
              <Button type="submit" disabled={isAdding || !newKeyword.trim()}>
                {isAdding ? "Adding..." : "Add Keyword"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Keyword Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Keywords
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockKeywords.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Key className="h-6 w-6 text-primary" />
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
                    {Math.round(mockKeywords.reduce((sum, k) => sum + k.rank, 0) / mockKeywords.length)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
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
                    {mockKeywords.reduce((sum, k) => sum + k.volume, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keywords Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Keyword Rankings
            </CardTitle>
            <CardDescription>
              Current rankings and performance metrics for all tracked keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Current Rank</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockKeywords.map((keyword) => {
                  const rankTrend = getRankTrend(keyword.rank, keyword.previousRank);
                  
                  return (
                    <TableRow key={keyword.id}>
                      <TableCell className="font-medium">{keyword.term}</TableCell>
                      <TableCell>{keyword.site}</TableCell>
                      <TableCell>
                        <Badge variant={keyword.rank <= 10 ? "default" : keyword.rank <= 20 ? "secondary" : "outline"}>
                          #{keyword.rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rankTrend.trend !== "same" && (
                          <div className="flex items-center gap-1">
                            {rankTrend.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${rankTrend.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                              {rankTrend.change}
                            </span>
                          </div>
                        )}
                        {rankTrend.trend === "same" && (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{keyword.volume.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyColor(keyword.difficulty)}>
                          {keyword.difficulty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}