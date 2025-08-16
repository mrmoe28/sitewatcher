import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Globe, Search, TrendingUp } from "lucide-react";

export default function AddSite() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here we would call the API to add the site
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Site Added Successfully",
        description: `${url} has been added to your monitoring list`,
      });
      
      setUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add site. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "SEO Analysis",
      description: "Comprehensive SEO audit including meta tags, headers, and content optimization"
    },
    {
      icon: TrendingUp,
      title: "Performance Monitoring",
      description: "Track page speed, Core Web Vitals, and overall site performance"
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Monitor your site's performance from multiple geographic locations"
    }
  ];

  return (
    <PageLayout 
      title="Add New Site" 
      description="Start monitoring a new website's SEO performance and get detailed insights"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Website for Monitoring
            </CardTitle>
            <CardDescription>
              Enter the URL of the website you want to monitor. We'll start analyzing its SEO performance immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Adding Site..." : "Add Site & Start Analysis"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
              <CardDescription>
                Once you add a site, you'll have access to these powerful features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}