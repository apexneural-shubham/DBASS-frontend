import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlowStore } from '@/store/flowStore';
import { 
  ArrowLeft, 
  ArrowUp, 
  MessageCircle, 
  Clock, 
  ExternalLink,
  Check,
  TrendingUp,
  Flame,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { redditApiService } from '@/services/redditApi';
import { apiService } from '@/services/api';
import { RedditPost } from '@/types';


const ThreadsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setThreadConfig, setSelectedThreads: setStoreThreads, setAnalysisResults, searchQuery: storedQuery, setSearchQuery: setStoredQuery, redditPosts: storedRedditPosts, setRedditPosts: setStoredRedditPosts } = useFlowStore();
  const [selectedThreads, setSelectedThreads] = useState<Set<string>>(new Set());
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>(storedRedditPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch Reddit posts on component mount
  useEffect(() => {
    let isMounted = true;
    
    const query = searchParams.get('query') || storedQuery;
    if (!query) {
      setHasError(true);
      toast.error('No search query provided', {
        icon: '⚠️',
      });
      return;
    }

    setSearchQuery(query);
    setStoredQuery(query); // Store query for back navigation
    
    // Only fetch if we don't have stored posts or if it's a new query
    if (isMounted) {
      if (storedRedditPosts.length === 0 || storedQuery !== query) {
    fetchRedditPosts(query);
      } else {
        // Use stored posts, no API call needed
        setRedditPosts(storedRedditPosts);
        toast.success(`Loaded ${storedRedditPosts.length} Reddit posts from cache!`, {
          icon: '⚡',
        });
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [searchParams, storedQuery, setStoredQuery, storedRedditPosts]);

  const fetchRedditPosts = async (query: string) => {
    setIsLoading(true);
    setHasError(false);

    const loadingToast = toast.loading('Searching Reddit...');

    try {
      const posts = await redditApiService.searchReddit(query, 5);
      
      toast.dismiss(loadingToast);
      
      if (posts.length === 0) {
        toast('No Reddit posts found for this query', {
          icon: 'ℹ️',
        });
      } else {
        toast.success(`Found ${posts.length} Reddit posts!`, {
          icon: '✅',
        });
      }

      setRedditPosts(posts);
      setStoredRedditPosts(posts); // Store posts for back navigation
    } catch (error) {
      toast.dismiss(loadingToast);
      setHasError(true);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch Reddit posts';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      console.error('Reddit API error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleProceed = async () => {
    if (selectedThreads.size === 0) {
      toast.error('Please select at least one thread', {
        icon: '⚠️',
      });
      return;
    }

    setIsProcessing(true);

    const loadingToast = toast.loading('Processing selected threads...');

    try {
      // Get the full thread data for selected threads
      const selectedThreadData = redditPosts.filter(post => 
        selectedThreads.has(post.id)
      );

      // Extract URLs from selected threads
      const urls = selectedThreadData.map(post => post.url);

      // Store selected threads in flow store
      setStoreThreads(selectedThreadData);

      // Step 1: Scrape the Reddit threads
      toast.loading('Scraping Reddit threads...', { id: loadingToast });
      const scrapedData = await apiService.scrapeRedditThreads(urls);

      // Step 2: Analyze the scraped data
      toast.loading('Analyzing pain points...', { id: loadingToast });
      const analysisResults = await apiService.analyzePainPoints(scrapedData);

      // Store analysis results in flow store
      setAnalysisResults(analysisResults);

      // Store thread config
    const config = Array.from(selectedThreads).map(threadId => ({
      threadId,
        selectedOptions: [threadId],
    }));
    setThreadConfig(config);

      toast.dismiss(loadingToast);
      toast.success(`${selectedThreads.size} thread${selectedThreads.size > 1 ? 's' : ''} analyzed successfully!`, {
      icon: '✅',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
    
    setTimeout(() => {
      navigate('/options');
    }, 300);
    } catch (error) {
      toast.dismiss(loadingToast);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process threads';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 5000,
      });

      console.error('Thread processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string): string => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return '1 day ago';
      return `${diffDays} days ago`;
    } catch {
      return 'Unknown';
    }
  };

  // Categorize Reddit posts (top upvoted = trending, rest distributed)
  const categorizePost = (post: RedditPost, index: number): 'trending' | 'hot' | 'rising' => {
    if (post.upvotes > 5000) return 'trending';
    if (index < 5) return 'hot';
    return 'rising';
  };

  const trendingThreads = redditPosts.filter((_, idx) => categorizePost(_, idx) === 'trending');
  const hotThreads = redditPosts.filter((_, idx) => categorizePost(_, idx) === 'hot');
  const risingThreads = redditPosts.filter((_, idx) => categorizePost(_, idx) === 'rising');

  // Render card for real Reddit post
  const renderRedditPostCard = (post: RedditPost, isSelected: boolean) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-6 transition-all',
        isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-slate-600'
      )}
    >
      {/* Thread Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white line-clamp-2">{post.title}</h3>
            {post.rank <= 3 && (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Top {post.rank}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
              r/{post.subreddit}
            </Badge>
          </div>
        </div>
        
        {/* Selection Toggle */}
        <motion.button
          onClick={() => toggleThreadSelection(post.id)}
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'border-slate-400 hover:border-orange-400'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Reddit Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4 text-orange-400" />
              <span className="text-white font-medium">{(post.upvotes || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="text-white font-medium">{(post.comments || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">{formatTimeAgo(post.created_utc)}</span>
            </div>
          </div>
        </div>

        {/* Thread Preview */}
        <div className="text-slate-300 text-sm leading-relaxed line-clamp-3">
          {post.preview}
        </div>

        {/* View on Reddit Link */}
        <div className="pt-2 border-t border-slate-700">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            View on Reddit
          </a>
        </div>
      </div>
    </motion.div>
  );

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-7xl mx-auto space-y-6 py-8"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </motion.div>

        <Breadcrumb />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Reddit Threads
            </h1>
            <p className="text-slate-400 text-lg mt-2">
              {searchQuery ? `Results for: "${searchQuery}"` : 'Select trending Reddit threads to monitor and analyze'}
            </p>
          </div>
          
          <AnimatePresence>
            {selectedThreads.size > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-4"
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-base shadow-lg">
                  {selectedThreads.size} thread{selectedThreads.size > 1 ? 's' : ''} selected
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-orange-400" />
            <p className="text-slate-400 text-lg">Searching Reddit...</p>
            <p className="text-slate-500 text-sm">This may take 10-30 seconds</p>
          </motion.div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-4">
              Failed to load Reddit threads
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="rounded-full px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Go Back
            </Button>
          </motion.div>
        )}

        {/* Trending Threads Section */}
        {!isLoading && !hasError && trendingThreads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Trending Threads</h2>
              <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Hot
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingThreads.map((post) => {
                const isSelected = selectedThreads.has(post.id);
                return renderRedditPostCard(post, isSelected);
              })}
            </div>
          </motion.div>
        )}

        {/* Hot Threads Section */}
        {!isLoading && !hasError && hotThreads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Hot Threads</h2>
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                Popular
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotThreads.map((post) => {
                const isSelected = selectedThreads.has(post.id);
                return renderRedditPostCard(post, isSelected);
              })}
            </div>
          </motion.div>
        )}

        {/* Rising Threads Section */}
        {!isLoading && !hasError && risingThreads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Rising Threads</h2>
              <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                New
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risingThreads.map((post) => {
                const isSelected = selectedThreads.has(post.id);
                return renderRedditPostCard(post, isSelected);
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && redditPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 text-lg mb-4">
              No Reddit posts found for "{searchQuery}"
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="rounded-full px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Try Another Search
            </Button>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isLoading && !hasError && redditPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center pt-8"
          >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleBack}
              variant="outline"
              className="rounded-2xl px-8 py-6 bg-slate-700 hover:bg-slate-600 text-white shadow-xl border-0"
            >
              ← Back to Categories
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleProceed}
              disabled={selectedThreads.size === 0 || isProcessing}
              className={cn(
                'rounded-2xl px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
                'text-white shadow-xl hover:shadow-2xl hover:shadow-orange-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Select Threads →'
              )}
            </Button>
          </motion.div>
          </motion.div>
        )}
      </motion.div>
  );
};

export default ThreadsPage;