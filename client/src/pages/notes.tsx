import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiProgress } from "@/components/ui/multi-progress";
import { useProgress } from "@/hooks/use-progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Globe, 
  Code, 
  Cpu, 
  Shield, 
  Search,
  Plus,
  Edit,
  Eye,
  Download,
  RefreshCw,
  Tag,
  Clock,
  Server,
  Smartphone,
  Zap
} from "lucide-react";

// Component moved inside to access hooks

const mockNotes = [
  {
    id: "1",
    siteId: "1",
    siteDomain: "example.com",
    title: "Tech Stack Analysis",
    category: "tech-stack",
    content: "React 18 with Next.js 14, hosted on Vercel. Uses Tailwind CSS for styling and TypeScript for type safety.",
    tags: ["React", "Next.js", "Vercel", "TypeScript"],
    lastUpdated: "2024-01-29T10:30:00Z",
    automated: true,
    techStack: {
      framework: "Next.js 14",
      library: "React 18",
      styling: "Tailwind CSS",
      language: "TypeScript",
      hosting: "Vercel",
      cdn: "Vercel CDN",
      analytics: "Google Analytics 4"
    }
  },
  {
    id: "2",
    siteId: "2",
    siteDomain: "demo.com",
    title: "Performance Optimization Notes",
    category: "performance",
    content: "Site loads in 2.3s on desktop, 3.8s on mobile. Images are not optimized. Suggest implementing lazy loading and WebP format.",
    tags: ["Performance", "Images", "Loading"],
    lastUpdated: "2024-01-28T15:45:00Z",
    automated: false,
    techStack: {
      framework: "WordPress",
      cms: "WordPress 6.4",
      hosting: "HostGator",
      plugins: ["Yoast SEO", "WP Rocket", "Elementor"]
    }
  },
  {
    id: "3",
    siteId: "3",
    siteDomain: "test.org",
    title: "Security Assessment",
    category: "security",
    content: "HTTPS enabled with valid SSL certificate. Content Security Policy headers present. No obvious security vulnerabilities detected.",
    tags: ["HTTPS", "SSL", "CSP", "Security"],
    lastUpdated: "2024-01-27T09:15:00Z",
    automated: true,
    techStack: {
      framework: "Vue.js 3",
      buildTool: "Vite",
      hosting: "Netlify",
      ssl: "Let's Encrypt"
    }
  }
];

export default function Notes() {
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const { toast } = useToast();
  const {
    createOperation,
    startOperation,
    cancelOperation,
    getActiveOperations
  } = useProgress();

  // Fetch real sites from API
  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activeOperations = getActiveOperations();
  const crawlerOperation = activeOperations.find(op => op.type === "site-comparison"); // Using existing type for demo

  const filteredNotes = mockNotes.filter(note => {
    const matchesSite = selectedSite === "all" || note.siteId === selectedSite;
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSite && matchesCategory && matchesSearch;
  });

  const handleAnalyzeSite = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    setIsAnalyzing(true);
    const operationId = createOperation(
      "site-comparison",
      `Analyzing ${site.domain}`,
      [
        {
          id: "crawl-pages",
          name: "Crawling Website",
          description: `Discovering pages and structure of ${site.domain}`,
          estimatedTime: 15
        },
        {
          id: "extract-tech",
          name: "Extracting Tech Stack",
          description: "Detecting frameworks, libraries, and technologies",
          estimatedTime: 10
        },
        {
          id: "analyze-performance",
          name: "Analyzing Performance",
          description: "Evaluating load times, optimization, and best practices",
          estimatedTime: 12
        },
        {
          id: "generate-notes",
          name: "Generating Notes",
          description: "Creating structured documentation and insights",
          estimatedTime: 8
        }
      ]
    );

    startOperation(operationId);

    // Simulate analysis process
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: `Comprehensive analysis of ${site.domain} has been completed and notes have been generated.`,
      });
      setIsAnalyzing(false);
    }, 12000); // 12 seconds for full analysis
  };

  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content for the note.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });

    setNewNote({ title: "", content: "", tags: "" });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tech-stack": return <Code className="h-4 w-4" />;
      case "performance": return <Zap className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "accessibility": return <Eye className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech-stack": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "performance": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "security": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "accessibility": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "mobile": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <PageLayout 
      title="Site Notes & Analysis" 
      description="Comprehensive website analysis, tech stack detection, and documentation management"
    >
      <div className="space-y-6">
        {/* Web Crawler Progress */}
        {crawlerOperation && (
          <MultiProgress
            title={crawlerOperation.title}
            stages={crawlerOperation.stages}
            currentStage={crawlerOperation.currentStage}
            overallProgress={crawlerOperation.overallProgress}
            canCancel={crawlerOperation.canCancel}
            onCancel={() => {
              cancelOperation(crawlerOperation.id);
              setIsAnalyzing(false);
            }}
          />
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website Analysis Tools
            </CardTitle>
            <CardDescription>
              Automatically analyze websites to extract tech stack information and generate insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="">
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select site to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => handleAnalyzeSite("1")}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Tech Stack'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All sites" />
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tech-stack">Tech Stack</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="accessibility">Accessibility</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Notes & Documentation</TabsTrigger>
            <TabsTrigger value="create">Create New Note</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            {/* Notes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Globe className="h-3 w-3" />
                          {note.siteDomain}
                          {note.automated && (
                            <Badge variant="outline" className="text-xs">
                              Auto-generated
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${getCategoryColor(note.category)}`}>
                        {getCategoryIcon(note.category)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {note.content}
                    </p>
                    
                    {/* Tech Stack Info */}
                    {note.techStack && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tech Stack
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(note.techStack).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500 capitalize">{key}:</span>
                              <span className="font-medium truncate ml-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(note.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notes found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No notes match your current filters. Try adjusting your search criteria.
                </p>
                <Button onClick={() => setSearchTerm("")} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Note
                </CardTitle>
                <CardDescription>
                  Add manual notes and observations about your websites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Site</label>
                    <Select defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Add your notes, observations, or documentation here..."
                    className="min-h-32"
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newNote.tags}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveNote} className="w-full">
                  Save Note
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}