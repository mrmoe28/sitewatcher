import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { URLAnalysisForm } from "@/components/dashboard/url-analysis-form";
import { LoadingState } from "@/components/dashboard/loading-state";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { SEORecommendations } from "@/components/dashboard/seo-recommendations";
import { KeywordPerformance } from "@/components/dashboard/keyword-performance";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { useQuery } from "@tanstack/react-query";
import type { Analysis } from "@shared/schema";

export default function Dashboard() {
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: currentAnalysisData } = useQuery({
    queryKey: ["/api/analyses", currentAnalysis],
    enabled: !!currentAnalysis,
    refetchInterval: (data: Analysis | undefined) => 
      data?.status === "pending" || data?.status === "running" ? 2000 : false,
  });

  const handleAnalysisStart = (analysisId: string) => {
    setCurrentAnalysis(analysisId);
  };

  const isLoading = (currentAnalysisData as Analysis)?.status === "pending" || (currentAnalysisData as Analysis)?.status === "running";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <URLAnalysisForm onAnalysisStart={handleAnalysisStart} />
              
              {isLoading && (
                <LoadingState 
                  progress={(currentAnalysisData as Analysis)?.progress || 0}
                  status={(currentAnalysisData as Analysis)?.statusMessage || "Starting analysis..."}
                />
              )}
              
              <div className="space-y-6">
                <MetricsOverview metrics={metrics} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SEORecommendations analysisId={currentAnalysis} />
                  <KeywordPerformance />
                </div>
                
                <RecentAnalyses onAnalysisStart={handleAnalysisStart} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
