import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SearchBar from '@/components/SearchBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useFlowStore } from '@/store/flowStore';
import { TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { TrendingTopic } from '@/types';

const SearchPage = () => {
  const navigate = useNavigate();
  const { setSearchQuery: setStoredQuery } = useFlowStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Fetch trending topics on component mount
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setIsLoadingTrending(true);
        const topics = await apiService.getTrendingTopics();
        setTrendingTopics(topics);
      } catch (error) {
        console.error('Failed to load trending topics:', error);
        toast.error('Failed to load trending topics');
        
        // Fallback to mock data for development
        const fallbackTopics: TrendingTopic[] = [
    {
      id: '1',
      category: 'Health',
      trend: '+245%',
            volume: '120K',
      title: 'AI Ethics in Healthcare',
    },
    {
      id: '2',
      category: 'Wealth',
      trend: '+189%',
            volume: '350K',
      title: 'Crypto Tax Planning 2025',
    },
    {
      id: '3',
      category: 'Relationships',
      trend: '+167%',
            volume: '89K',
      title: 'Remote Relationship Building',
    },
    {
      id: '4',
      category: 'Health',
      trend: '+134%',
            volume: '210K',
      title: 'Biohacking for Longevity',
    },
    {
      id: '5',
      category: 'Wealth',
      trend: '+128%',
            volume: '180K',
      title: 'Sustainable Investing',
    },
    {
      id: '6',
      category: 'Relationships',
      trend: '+112%',
            volume: '95K',
      title: 'Digital Dating Safety',
    },
  ];

        setTrendingTopics(fallbackTopics);
        toast.success('Using fallback trending topics', { icon: '🔄' });
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', {
        icon: '⚠️',
      });
      return;
    }

    // Show loading state
    setIsLoading(true);
    const loadingToast = toast.loading('Generating market ideas...', {
      icon: '🔍',
    });

    try {
      // Call the backend API to generate market ideas
      const marketIdeas = await apiService.searchMarketIdeas(searchQuery);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success(`Results ready for: ${searchQuery}`, {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
        duration: 2000,
      });

      // Store the results in sessionStorage to pass to CategoriesPage
      sessionStorage.setItem('searchResults', JSON.stringify(marketIdeas));
      sessionStorage.setItem('searchQuery', searchQuery);
      setStoredQuery(searchQuery);

      // Navigate to results page with the search query
      setTimeout(() => {
        navigate(`/results?q=${encodeURIComponent(searchQuery)}`);
      }, 300);

    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show error toast
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate market ideas. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = async (topic: TrendingTopic) => {
    // Set the search query to the actual topic title
    setSearchQuery(topic.title);
    setStoredQuery(topic.title);
    
    toast.success(`Exploring: ${topic.title}`, {
      icon: '🔥',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
    
    // Show loading state
    setIsLoading(true);
    const loadingToast = toast.loading('Generating market ideas...', {
      icon: '🔍',
    });

    try {
      // Call the backend API to generate market ideas for this topic
      const marketIdeas = await apiService.searchMarketIdeas(topic.title);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success toast
      toast.success(`Results ready for: ${topic.title}`, {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
        },
        duration: 2000,
      });

      // Store the results in sessionStorage to pass to ResultsPage
      sessionStorage.setItem('searchResults', JSON.stringify(marketIdeas));
      sessionStorage.setItem('searchQuery', topic.title);

      // Navigate to results page with the topic as query
    setTimeout(() => {
        navigate(`/results?q=${encodeURIComponent(topic.title)}`);
    }, 300);

    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show error toast
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate market ideas. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });

      console.error('Trending topic search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    toast('Voice search coming soon!', {
      icon: '🎤',
      duration: 2000,
    });
  };

  const handleViewMore = () => {
    toast('Loading more topics...', {
      icon: '📊',
      duration: 2000,
    });
  };

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSearchFocused]);

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-7xl mx-auto space-y-8 py-8"
      >
        <Breadcrumb />
        
        
        {/* Title with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to DBAAS
          </h1>
          <p className="text-slate-400 text-lg">
            Discover trending topics and choose your category
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          <div 
            className={cn(
              'transition-all duration-300',
              isSearchFocused && 'scale-[1.02]'
            )}
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onVoiceClick={handleVoiceSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmit={handleSearchSubmit}
            />
          </div>

          {/* Loading indicator below search bar */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 top-full mt-4 flex items-center justify-center gap-3 text-cyan-400"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Generating market ideas with AI...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Exploding Topics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 pt-8"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-white">Exploding Topics</h2>
            {isLoadingTrending && <Loader2 className="h-5 w-5 animate-spin text-orange-400" />}
          </div>

          {/* Loading State */}
          {isLoadingTrending ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
                    <div className="h-8 w-16 bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : trendingTopics.length > 0 ? (
            <>
          {/* Topic Cards Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {trendingTopics.map((topic) => (
              <motion.div
                key={topic.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTopicClick(topic)}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 cursor-pointer transition-all hover:border-slate-600 group"
              >
                    {/* Topic Info */}
                    <div className="flex flex-col h-full justify-between">
                {/* Topic Title */}
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors leading-tight mb-4">
                  {topic.title}
                </h3>
                      
                      {/* Metrics Row */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-700">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Volume:</span>
                          <span className="text-sm font-bold text-blue-400">{topic.volume}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Growth:</span>
                          <span className="text-lg font-bold text-green-400">{topic.trend}</span>
                        </div>
                      </div>
                    </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View More Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center pt-4"
          >
            <Button
              onClick={handleViewMore}
              className="rounded-full px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              View More
            </Button>
          </motion.div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No trending topics available at the moment.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
  );
};

export default SearchPage;