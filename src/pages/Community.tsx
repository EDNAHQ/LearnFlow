import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainNav } from "@/components/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Eye, Heart, GitFork, Star } from "lucide-react";
import { getTopTrending } from "@/utils/trendingScore";

interface CommunityPath {
  id: string;
  topic: string;
  title: string | null;
  created_at: string;
  published_at: string | null;
  is_completed: boolean;
  is_featured: boolean | null;
  view_count: number;
  like_count: number;
  fork_count: number;
  user_id: string;
  tags: string[] | null;
  difficulty_level: string | null;
  category: string | null;
  profile: {
    username: string | null;
  };
  user_liked?: boolean;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paths, setPaths] = useState<CommunityPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState<string[]>([]);
  const [generatedPathIds, setGeneratedPathIds] = useState<string[]>([]);

  useEffect(() => {
    loadCommunityPaths();
    getCurrentUser();
  }, [sortBy]);

  // Auto-generate topics if community is empty (one-time, immediate)
  useEffect(() => {
    const generateIfEmpty = async () => {
      const hasGenerated = sessionStorage.getItem('community-topics-generated');
      if (hasGenerated) return;
      
      // Wait for initial load to complete
      if (!loading && paths.length === 0) {
        console.log('Community is empty - generating topics now...');
        sessionStorage.setItem('community-topics-generated', 'true');
        try {
          const { data, error } = await supabase.functions.invoke('generate-daily-community-topics', { 
            body: {} 
          });
          
          if (error) {
            console.error('Generation error:', error);
            toast({
              title: "Generation failed",
              description: error.message,
              variant: "destructive"
            });
          } else {
            console.log('Generation started:', data);
            toast({
              title: "Generating topics...",
              description: "Creating learning paths, please wait...",
            });
            // Reload after a delay
            setTimeout(() => {
              loadCommunityPaths();
            }, 5000);
          }
        } catch (error: any) {
          console.error('Failed to generate:', error);
        }
      }
    };
    
    // Check after loading completes
    if (!loading) {
      generateIfEmpty();
    }
  }, [loading, paths.length]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCommunityPaths = async () => {
    setLoading(true);
    try {
      // Simple query - get all public paths
      // Include paths with or without published_at (some might be missing it)
      let query = supabase
        .from('learning_paths')
        .select('*')
        .eq('is_public', true);

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('published_at', { ascending: false, nullsFirst: false })
                     .order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('like_count', { ascending: false });
      } else if (sortBy === 'views') {
        query = query.order('view_count', { ascending: false });
      } else if (sortBy === 'featured') {
        query = query.eq('is_featured', true).order('featured_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading community paths:', error);
        throw error;
      }

      console.log('Loaded community paths:', data?.length || 0, 'paths');
      console.log('Sample path data:', data?.[0]);

      // Apply trending sort client-side if needed
      let processedData = data || [];
      
      // Ensure all paths have required fields
      processedData = processedData
        .filter(path => path !== null && path !== undefined)
        .map(path => ({
          ...path,
          profile: path.profile || { username: null }
        }));
      if (sortBy === 'trending') {
        processedData = getTopTrending(processedData, processedData.length, 30);
      }

      // Check if current user has liked each path
      if (currentUserId && processedData.length > 0) {
        const pathIds = processedData.map(p => p.id);
        const { data: interactions } = await supabase
          .from('path_interactions')
          .select('path_id')
          .eq('user_id', currentUserId)
          .eq('interaction_type', 'like')
          .in('path_id', pathIds);

        const likedPaths = new Set(interactions?.map(i => i.path_id) || []);

        setPaths(processedData.map(path => ({
          ...path,
          user_liked: likedPaths.has(path.id),
          profile: path.profile || { username: null } // Ensure profile exists even if null
        })));
      } else {
        setPaths(processedData.map(path => ({
          ...path,
          profile: path.profile || { username: null } // Ensure profile exists even if null
        })));
      }
    } catch (error) {
      console.error('Error loading community paths:', error);
      toast({
        title: "Error loading community paths",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (pathId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like learning paths",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        path_id_param: pathId,
        user_id_param: currentUserId
      });

      if (error) throw error;

      // Update local state
      setPaths(prev => prev.map(path => {
        if (path.id === pathId) {
          return {
            ...path,
            user_liked: data,
            like_count: data ? path.like_count + 1 : Math.max(0, path.like_count - 1)
          };
        }
        return path;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error updating like",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleViewPath = async (path: CommunityPath) => {
    // Track view if user is signed in
    if (currentUserId) {
      await supabase.rpc('increment_view_count', {
        path_id_param: path.id,
        viewer_id: currentUserId
      });
    }

    // Navigate to the learning path
    sessionStorage.setItem("learn-topic", path.topic);
    sessionStorage.setItem("learning-path-id", path.id);
    navigate(`/content/${path.id}/step/0`);
  };

  const handleFork = async (pathId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to fork learning paths",
      });
      return;
    }

    try {
      const { data: newPathId, error } = await supabase.rpc('fork_learning_path', {
        source_path_id: pathId,
        new_owner_id: currentUserId
      });

      if (error) throw error;

      toast({
        title: "Fork created",
        description: "We copied this path into your projects.",
      });

      if (newPathId) {
        sessionStorage.setItem("learning-path-id", newPathId);
        navigate(`/content/${newPathId}/step/0`);
      } else {
        navigate('/projects');
      }
    } catch (err) {
      console.error('Error forking path:', err);
      toast({
        title: "Fork failed",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    }
  };

  const filteredPaths = paths.filter(path => {
    if (searchQuery) {
      return path.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (path.title && path.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  // Calculate stats
  const totalPaths = filteredPaths.length;
  const totalViews = filteredPaths.reduce((sum, path) => sum + path.view_count, 0);
  const totalLikes = filteredPaths.reduce((sum, path) => sum + path.like_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Compact Hero Channel */}
      <section className="relative bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_2.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl md:text-3xl font-bold text-white"
              >
                Community Learning
              </motion.h1>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6 md:gap-8"
            >
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{totalPaths}</div>
                <div className="text-xs text-white/70">Paths</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{totalViews}</div>
                <div className="text-xs text-white/70">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{totalLikes}</div>
                <div className="text-xs text-white/70">Likes</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Generate button clicked');
                setGenerating(true);
                setGeneratingTopics(['Generating topic 1...', 'Generating topic 2...']);
                toast({ title: "Generating...", description: "Creating 2 new topics..." });
                
                try {
                  console.log('Calling edge function...');
                  const { data, error } = await supabase.functions.invoke('generate-daily-community-topics', { 
                    body: {} 
                  });
                  
                  console.log('Function response:', { data, error });
                  
                  if (error) {
                    console.error('Function error:', error);
                    setGeneratingTopics([]);
                    toast({ 
                      title: "Error", 
                      description: error.message || JSON.stringify(error), 
                      variant: "destructive" 
                    });
                  } else if (data) {
                    console.log('Success! Created paths:', data.pathsCreated, data.pathIds);
                    console.log('Topics attempted:', data.topicsAttempted);
                    console.log('Skipped:', data.skipped);
                    console.log('Errors:', data.errors);
                    
                    if (data.pathIds && data.pathIds.length > 0) {
                      setGeneratedPathIds(data.pathIds);
                      toast({ 
                        title: "Success!", 
                        description: `Generated ${data.pathsCreated} new topics!` 
                      });
                    } else if (data.topicsAttempted) {
                      // Show what topics were attempted
                      setGeneratingTopics(data.topicsAttempted.map((t: string, i: number) => 
                        `${t} ${data.errors?.some((e: string) => e.includes(t)) ? '(skipped)' : '(already exists)'}`
                      ));
                      toast({ 
                        title: "No new topics created", 
                        description: `${data.skipped || 0} topics skipped (already exist). ${data.errors?.length || 0} errors. Try again for different topics.`,
                        variant: "default"
                      });
                      setTimeout(() => setGeneratingTopics([]), 5000);
                    } else {
                      toast({ 
                        title: "No new topics", 
                        description: data.errors?.join(', ') || "All topics already exist. Try again for different topics.",
                        variant: "default"
                      });
                      setGeneratingTopics([]);
                    }
                    
                    // Reload paths immediately if we created any
                    if (data.pathIds && data.pathIds.length > 0) {
                      setTimeout(() => {
                        console.log('Reloading community paths...');
                        loadCommunityPaths();
                        setGeneratingTopics([]);
                      }, 2000);
                    }
                  } else {
                    console.warn('No data returned from function');
                    setGeneratingTopics([]);
                    toast({ 
                      title: "No response", 
                      description: "Function completed but no data returned. Check console.",
                      variant: "destructive"
                    });
                  }
                } catch (err: any) {
                  console.error('Exception calling function:', err);
                  setGeneratingTopics([]);
                  toast({ 
                    title: "Exception", 
                    description: err.message || String(err), 
                    variant: "destructive" 
                  });
                } finally {
                  setGenerating(false);
                }
              }}
              disabled={generating}
              className="brand-gradient text-white"
              variant="outline"
            >
              {generating ? "Generating..." : "Generate 2 New Topics"}
            </Button>
          </div>
        </motion.div>

        {/* Paths Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6654f5]"></div>
              Loading community paths...
            </div>
          </div>
        ) : filteredPaths.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <img
              src="/images/sam.mckay.edna_Floating_geometric_panels_with_glowing_icons_f_cd9121b1-2415-449c-9fd6-510878bd750a_0.png"
              alt="No content"
              className="h-40 w-auto mx-auto mb-6 opacity-50 object-contain"
            />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No public learning paths yet</h2>
            <p className="text-gray-500 mb-6">
              Be the first to share your knowledge with the community!
            </p>
            <Button
              onClick={() => navigate('/projects')}
              className="brand-gradient text-white"
            >
              Go to My Projects
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Show generating cards */}
            {generatingTopics.map((topic, idx) => (
              <motion.div
                key={`generating-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Card className="h-full overflow-hidden bg-white border-2 border-dashed border-brand-purple/30">
                  <div className="h-1 bg-gradient-to-r from-brand-purple to-brand-pink animate-pulse" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-purple border-t-transparent" />
                      <span className="text-xs font-medium text-brand-purple">Generating...</span>
                    </div>
                    <h3 className="font-semibold text-brand-black text-lg">{topic}</h3>
                    <div className="text-xs text-gray-400 mt-2">Creating learning path...</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {/* Show existing paths */}
            {filteredPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="h-full overflow-hidden bg-white border border-gray-100 hover:border-[#6654f5]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#6654f5]/10 group cursor-pointer"
                  onClick={() => handleViewPath(path)}
                >
                  {/* Gradient accent bar at top */}
                  <div className="h-1 brand-gradient" />

                  <CardHeader className="pb-4 relative">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {path.is_featured && (
                          <span className="inline-flex items-center gap-1 py-1 px-2 rounded-full text-xs font-medium bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] text-white shadow-sm">
                            <Star className="w-3 h-3 fill-white" />
                            Featured
                          </span>
                        )}
                        {path.is_completed ? (
                          <span className="inline-flex items-center py-1 px-2 rounded-full text-xs font-medium bg-gradient-to-r from-[#6654f5]/10 to-[#ca5a8b]/10 text-[#6654f5] border border-[#6654f5]/20">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center py-1 px-2 rounded-full text-xs font-medium bg-gradient-to-r from-[#ca5a8b]/10 to-[#f2b347]/10 text-[#ca5a8b] border border-[#ca5a8b]/20">
                            Public Path
                          </span>
                        )}
                        {path.difficulty_level && (
                          <span className="inline-flex items-center py-1 px-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {path.difficulty_level.charAt(0).toUpperCase() + path.difficulty_level.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title Section */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0b0c18] text-lg leading-tight mb-1 group-hover:text-[#6654f5] transition-colors duration-300">
                            {path.title || path.topic}
                          </h3>
                          <div className="text-xs text-gray-500">
                            <span>by {path.profile?.username || 'LearnFlow'}</span>
                            {path.published_at && (
                              <span className="ml-2">• {formatDistanceToNow(new Date(path.published_at), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4">
                    {/* Community metrics */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-500" title="Views">
                        <Eye className="h-4 w-4" aria-hidden />
                        <span className="text-xs text-gray-600 font-semibold">{path.view_count}</span>
                      </div>
                      <button
                        onClick={(e) => handleLike(path.id, e)}
                        className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                          path.user_liked
                            ? 'text-[#ca5a8b] bg-[#ca5a8b]/10'
                            : 'text-gray-500 hover:text-[#ca5a8b] hover:bg-[#ca5a8b]/10'
                        }`}
                        aria-pressed={path.user_liked}
                        aria-label={path.user_liked ? 'Unlike' : 'Like'}
                        title={path.user_liked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          className={`h-4 w-4 ${path.user_liked ? 'fill-current' : ''}`}
                          strokeWidth={path.user_liked ? 0 : 2}
                        />
                        <span className="text-xs font-semibold">{path.like_count}</span>
                      </button>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 pb-5 border-t border-gray-100">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 group/btn relative overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPath(path);
                        }}
                      >
                        <div className="absolute inset-0 brand-gradient opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                        <span className="relative font-medium text-[#6654f5] group-hover/btn:text-[#6654f5]">
                          View
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={(e) => handleFork(path.id, e)}
                        title="Fork to My Projects"
                        aria-label="Fork to My Projects"
                      >
                        <GitFork className="h-4 w-4" />
                        Fork
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;