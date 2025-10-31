import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketIdeasResponse } from '@/types';

interface NestedTopic {
  [key: string]: NestedTopic | Record<string, never>;
}

interface MainTopicData {
  name: string;
  subtopics: string[];
}

interface ParsedResult {
  mainTopic: string;
  childTopic: string;
  topics: MainTopicData[];
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const [parsedResults, setParsedResults] = useState<ParsedResult | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Parse the nested API response
  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('searchResults');
      const storedQuery = sessionStorage.getItem('searchQuery');

      if (storedResults && storedQuery === searchQuery) {
        const marketIdeas: MarketIdeasResponse = JSON.parse(storedResults);
        const parsed = parseMarketIdeas(marketIdeas);
        setParsedResults(parsed);
        setHasError(false);
      } else {
        setHasError(true);
        toast.error('No search results found. Please try searching again.', {
          icon: '⚠️',
        });
      }
    } catch (error) {
      console.error('Error loading search results:', error);
      setHasError(true);
      toast.error('Failed to load search results', {
        icon: '❌',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Parse the nested structure dynamically: Each main topic becomes a dropdown with its subtopics
  const parseMarketIdeas = (data: MarketIdeasResponse): ParsedResult | null => {
    // Get the first main topic (e.g., "Wealth", "Health", "Relationships")
    const mainTopicKey = Object.keys(data)[0];
    if (!mainTopicKey) return null;

    const mainTopicData = data[mainTopicKey];
    
    // Get the first child topic (e.g., "Digital Media Tools")
    const childTopicKey = Object.keys(mainTopicData)[0];
    if (!childTopicKey) return null;

    const categoriesData = mainTopicData[childTopicKey];
    
    // Each category becomes a main topic with its own dropdown
    const topicsList: MainTopicData[] = [];
    
    // First level: Categories (e.g., "AI Image Enhancement")
    Object.entries(categoriesData).forEach(([categoryName, categoryContent]) => {
      // Second level: Main topics under each category (e.g., "Photo Restoration", "Batch Processing")
      Object.entries(categoryContent as NestedTopic).forEach(([mainTopicName, subtopicsData]) => {
        // Third level: Subtopics (the actual leaf nodes)
        const subtopicsList = Object.keys(subtopicsData).filter(key => key !== '');
        
        topicsList.push({
          name: mainTopicName,
          subtopics: subtopicsList,
        });
      });
    });

    return {
      mainTopic: mainTopicKey,
      childTopic: childTopicKey,
      topics: topicsList,
    };
  };

  const toggleTopic = (topicName: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicName)) {
        next.delete(topicName);
      } else {
        next.add(topicName);
      }
      return next;
    });
  };

  const handleTopicSelect = (topicName: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicName)) {
        next.delete(topicName);
      } else {
        next.add(topicName);
      }
      return next;
    });
  };

  const handleProceed = () => {
    const allSelected = Array.from(selectedTopics);
    
    if (allSelected.length === 0) {
      toast.error('Please select at least one topic', { icon: '⚠️' });
      return;
    }
    
    // Navigate to threads with all selected topics as a combined query
    const query = allSelected.join(', ');
    toast.success(`Searching Reddit for ${allSelected.length} topic${allSelected.length > 1 ? 's' : ''}!`, { 
      icon: '🔍' 
    });
    
    setTimeout(() => {
      navigate(`/threads?query=${encodeURIComponent(query)}`);
    }, 300);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const formatTitle = (query: string) => {
    return query
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const pageTitle = searchQuery ? formatTitle(searchQuery) : 'Search Results';

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
            Back to Search
          </Button>
        </motion.div>

        <Breadcrumb />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
          {parsedResults && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-lg">{parsedResults.mainTopic}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-lg font-semibold text-cyan-400">
                {parsedResults.childTopic}
              </span>
            </div>
          )}
          <p className="text-slate-400 text-base">
            {parsedResults ? `${parsedResults.topics.length} topics found` : 'Loading results...'}
          </p>
          {selectedTopics.size > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full border border-cyan-500/30 mt-2"
            >
              <Check className="h-4 w-4" />
              {selectedTopics.size} selected
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            <p className="text-slate-400 text-lg">Loading results...</p>
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
              Failed to load search results
            </p>
            <Button
              onClick={handleBack}
              className="rounded-full px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Back to Search
            </Button>
          </motion.div>
        )}

        {/* Results - Topic Dropdown Accordions */}
        {!isLoading && !hasError && parsedResults && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4"
          >
            {parsedResults.topics.map((topic, index) => {
              const isExpanded = expandedTopics.has(topic.name);
              const isSelected = selectedTopics.has(topic.name);

              return (
                <motion.div
                  key={`${topic.name}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Card className={cn(
                    "bg-slate-800/50 backdrop-blur-sm transition-all cursor-pointer border-2",
                    isSelected 
                      ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20" 
                      : "border-slate-700/50 hover:border-slate-600"
                  )}>
                    {/* Header - Always visible */}
                    <CardHeader 
                      className="py-4 px-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicSelect(topic.name);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Selection Checkbox */}
                          <div className={cn(
                            'w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                            isSelected
                              ? 'bg-cyan-500 border-cyan-500 text-white'
                              : 'border-slate-500 hover:border-cyan-400'
                          )}>
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                          
                          {/* Topic Name */}
                          <CardTitle className="text-lg text-white font-semibold">
                            {topic.name}
                          </CardTitle>
                          
                          {/* Subtopic Count Badge */}
                          {topic.subtopics.length > 0 && (
                            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                              {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {/* Expand/Collapse Button */}
                        {topic.subtopics.length > 0 && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopic(topic.name);
                            }}
                            className="cursor-pointer p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                          >
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>

                    {/* Expandable Subtopics Section */}
                    <AnimatePresence initial={false}>
                      {isExpanded && topic.subtopics.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <CardContent className="pt-0 pb-4 px-6">
                            <div className="border-t border-slate-700/50 pt-3">
                              <ul className="space-y-2">
                                {topic.subtopics.map((subtopic, subIndex) => (
                                  <motion.li
                                    key={`${subtopic}-${subIndex}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.05 }}
                                    className="flex items-start gap-3 text-slate-300 hover:text-cyan-400 transition-colors group"
                                          >
                                    <span className="text-cyan-500 mt-1.5 flex-shrink-0">•</span>
                                    <span className="text-sm leading-relaxed">{subtopic}</span>
                                  </motion.li>
                                ))}
                              </ul>
                                </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Empty subtopics message */}
                    {topic.subtopics.length === 0 && (
                      <CardContent className="pt-0 pb-4 px-6">
                        <p className="text-slate-500 text-sm italic">No subtopics available</p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && parsedResults && parsedResults.topics.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 text-lg mb-4">
              No topics found in the results
            </p>
            <Button
              onClick={handleBack}
              className="rounded-full px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Back to Search
            </Button>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isLoading && !hasError && parsedResults && parsedResults.topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between items-center pt-8 pb-4"
          >
            <Button
              onClick={handleBack}
              variant="outline"
              className="rounded-2xl px-8 py-6 bg-slate-700 hover:bg-slate-600 text-white shadow-xl border-0"
            >
              New Search
            </Button>

            <Button
              onClick={handleProceed}
              disabled={selectedTopics.size === 0}
              className={cn(
                "rounded-2xl px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl transition-all",
                selectedTopics.size === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              Search Reddit ({selectedTopics.size} selected) →
            </Button>
          </motion.div>
        )}
      </motion.div>
  );
};

export default ResultsPage;

