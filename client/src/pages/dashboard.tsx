import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
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
    <PageLayout 
      title="SEO Dashboard" 
      description="Monitor your website's SEO performance and get actionable insights"
    >
      <div className="space-y-6">
        <URLAnalysisForm onAnalysisStart={handleAnalysisStart} />
        
        {isLoading && (
          <LoadingState 
            progress={(currentAnalysisData as Analysis)?.progress || 0}
            status={(currentAnalysisData as Analysis)?.statusMessage || "Starting analysis..."}
          />
        )}
        
        <MetricsOverview metrics={metrics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SEORecommendations analysisId={currentAnalysis} />
          <KeywordPerformance />
        </div>
        
        <RecentAnalyses onAnalysisStart={handleAnalysisStart} />
      </div>
    </PageLayout>
  );
}
