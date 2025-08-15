import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function KeywordPerformance() {
  const { data: keywords = [] } = useQuery({
    queryKey: ["/api/sites", "keywords"],
    queryFn: async () => {
      // For now, return empty array since we don't have site selection
      return [];
    },
  });

  // Sample data for demonstration
  const sampleKeywords = [
    {
      id: "1",
      term: "web development",
      volume: 12000,
      rank: 3,
      change: 2,
    },
    {
      id: "2", 
      term: "seo optimization",
      volume: 8500,
      rank: 7,
      change: -1,
    },
    {
      id: "3",
      term: "website analysis", 
      volume: 5200,
      rank: 12,
      change: 5,
    },
  ];

  const displayKeywords = keywords.length > 0 ? keywords : sampleKeywords;

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Top Keywords</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Current rankings and trends
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayKeywords.map((keyword: any) => {
            const isPositive = keyword.change >= 0;
            const ArrowIcon = isPositive ? ArrowUp : ArrowDown;
            
            return (
              <div key={keyword.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`keyword-${keyword.id}`}>
                    {keyword.term}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Search volume: {keyword.volume?.toLocaleString() || 0}/month
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{keyword.rank}
                    </div>
                    <div className="flex items-center text-xs">
                      <ArrowIcon 
                        className={`mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} 
                        size={10} 
                      />
                      <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {isPositive ? '+' : ''}{keyword.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full"
            data-testid="view-keywords-button"
          >
            View All Keywords
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
