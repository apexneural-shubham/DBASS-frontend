import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketIdeasResponse } from '@/types';

interface SubNiche {
  name: string;
  trend?: string;
}

interface Subcategory {
  name: string;
  subNiches?: SubNiche[];
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// Sample hierarchical data - this would come from your API/store
const categoryData: Record<string, Category[]> = {
  'Wealth': [
    {
      id: 'wealth-1',
      name: 'First-Time Wealth Management for Above 60',
      subcategories: [
        {
          name: 'Retirement Planning',
          subNiches: [
            { name: 'Late-start retirement strategies', trend: '+156%' },
            { name: 'Social security optimization', trend: '+134%' },
            { name: 'Healthcare cost planning', trend: '+128%' },
          ],
        },
        {
          name: 'Investment Strategies',
          subNiches: [
            { name: 'Conservative portfolio allocation', trend: '+145%' },
            { name: 'Fixed income securities', trend: '+112%' },
            { name: 'Dividend-focused investing', trend: '+98%' },
          ],
        },
        {
          name: 'Estate Planning',
          subNiches: [
            { name: 'Will and trust creation', trend: '+167%' },
            { name: 'Beneficiary designation', trend: '+89%' },
            { name: 'Tax-efficient inheritance', trend: '+123%' },
          ],
        },
      ],
    },
    {
      id: 'wealth-2',
      name: 'Crypto Tax Planning 2025',
      subcategories: [
        {
          name: 'Tax Reporting',
          subNiches: [
            { name: 'DeFi transaction tracking', trend: '+189%' },
            { name: 'NFT capital gains', trend: '+145%' },
            { name: 'Staking income reporting', trend: '+167%' },
          ],
        },
        {
          name: 'Tax Optimization',
          subNiches: [
            { name: 'Tax-loss harvesting strategies', trend: '+178%' },
            { name: 'Like-kind exchange considerations', trend: '+134%' },
            { name: 'Offshore compliance', trend: '+156%' },
          ],
        },
      ],
    },
    {
      id: 'wealth-3',
      name: 'Sustainable Investing',
      subcategories: [
        {
          name: 'ESG Funds',
          subNiches: [
            { name: 'Green bond investments', trend: '+145%' },
            { name: 'Carbon credit markets', trend: '+123%' },
            { name: 'Renewable energy stocks', trend: '+167%' },
          ],
        },
        {
          name: 'Impact Investing',
          subNiches: [
            { name: 'Social enterprise funding', trend: '+134%' },
            { name: 'Community development', trend: '+112%' },
            { name: 'Microfinance opportunities', trend: '+98%' },
          ],
        },
      ],
    },
  ],
  'Health': [
    {
      id: 'health-1',
      name: 'AI Ethics in Healthcare',
      subcategories: [
        {
          name: 'Data Privacy',
          subNiches: [
            { name: 'Patient data protection', trend: '+245%' },
            { name: 'HIPAA compliance in AI', trend: '+189%' },
            { name: 'Anonymization techniques', trend: '+167%' },
          ],
        },
        {
          name: 'Algorithm Bias',
          subNiches: [
            { name: 'Diagnostic fairness', trend: '+178%' },
            { name: 'Treatment recommendations', trend: '+145%' },
            { name: 'Risk assessment equity', trend: '+134%' },
          ],
        },
      ],
    },
    {
      id: 'health-2',
      name: 'Biohacking for Longevity',
      subcategories: [
        {
          name: 'Nutrition Optimization',
          subNiches: [
            { name: 'Intermittent fasting protocols', trend: '+156%' },
            { name: 'Ketogenic optimization', trend: '+134%' },
            { name: 'Supplement stacks', trend: '+145%' },
          ],
        },
        {
          name: 'Sleep Enhancement',
          subNiches: [
            { name: 'Circadian rhythm hacking', trend: '+167%' },
            { name: 'Sleep tracking technology', trend: '+123%' },
            { name: 'Melatonin optimization', trend: '+112%' },
          ],
        },
      ],
    },
  ],
  'Relationships': [
    {
      id: 'relationships-1',
      name: 'Remote Relationship Building',
      subcategories: [
        {
          name: 'Digital Communication',
          subNiches: [
            { name: 'Virtual date ideas', trend: '+167%' },
            { name: 'Video call intimacy', trend: '+145%' },
            { name: 'Online game nights', trend: '+123%' },
          ],
        },
        {
          name: 'Long-Distance Strategies',
          subNiches: [
            { name: 'Time zone management', trend: '+134%' },
            { name: 'Visit planning optimization', trend: '+112%' },
            { name: 'Shared digital experiences', trend: '+98%' },
          ],
        },
      ],
    },
    {
      id: 'relationships-2',
      name: 'Digital Dating Safety',
      subcategories: [
        {
          name: 'Profile Verification',
          subNiches: [
            { name: 'Catfish detection', trend: '+178%' },
            { name: 'Background check services', trend: '+156%' },
            { name: 'Video verification tools', trend: '+134%' },
          ],
        },
        {
          name: 'Privacy Protection',
          subNiches: [
            { name: 'Location masking', trend: '+145%' },
            { name: 'Secure messaging apps', trend: '+123%' },
            { name: 'Identity theft prevention', trend: '+112%' },
          ],
        },
      ],
    },
  ],
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load search results from sessionStorage
  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('searchResults');
      const storedQuery = sessionStorage.getItem('searchQuery');

      // If we have stored results and they match the query parameter
      if (storedResults && storedQuery === searchQuery) {
        const marketIdeas: MarketIdeasResponse = JSON.parse(storedResults);
        const transformedCategories = transformMarketIdeas(marketIdeas);
        setCategories(transformedCategories);
        setHasError(false);
      } else if (!storedResults && !searchQuery) {
        // Fallback to mock data if no search query
        const category = searchParams.get('category') || 'Wealth';
        setCategories(categoryData[category] || []);
        setHasError(false);
      } else {
        // No data available
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
      setIsLoadingData(false);
    }
  }, [searchQuery, searchParams]);

  // Transform backend response to component format
  const transformMarketIdeas = (marketIdeas: MarketIdeasResponse): Category[] => {
    const transformedCategories: Category[] = [];
    let categoryIndex = 0;

    // Iterate through core markets (Health, Wealth, Relationships)
    Object.entries(marketIdeas).forEach(([coreMarket, categories]) => {
      // Iterate through categories
      Object.entries(categories).forEach(([categoryName, subcategories]) => {
        const transformedSubcategories: Subcategory[] = [];

        // Iterate through subcategories
        Object.entries(subcategories).forEach(([subcategoryName, niches]) => {
          const subNiches: SubNiche[] = [];

          // Iterate through niches and sub-niches
          Object.entries(niches).forEach(([nicheName, subNichesObj]) => {
            // Add niche as a sub-niche
            subNiches.push({ name: nicheName });

            // Add all sub-niches under this niche
            Object.keys(subNichesObj).forEach((subNicheName) => {
              subNiches.push({ name: subNicheName });
            });
          });

          transformedSubcategories.push({
            name: subcategoryName,
            subNiches: subNiches,
          });
        });

        transformedCategories.push({
          id: `${coreMarket.toLowerCase()}-${categoryIndex++}`,
          name: categoryName,
          subcategories: transformedSubcategories,
        });
      });
    });

    return transformedCategories;
  };
  // Format search query with proper casing
  const formatTitle = (query: string) => {
    return query
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Use search query as title
  const pageTitle = searchQuery 
    ? formatTitle(searchQuery) 
    : 'Market Categories';

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleCategorySelection = (cardId: string) => {
    // Toggle selection: if clicking the same card, deselect it
    setSelectedCategory((prev) => prev === cardId ? null : cardId);
    
    // Show feedback
    toast.success('Category selected', {
      icon: '✓',
      duration: 1000,
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    toast.success(`Exploring: ${subcategoryName}`, {
      icon: '🔍',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
    // Navigate to threads page
    setTimeout(() => {
      navigate('/threads');
    }, 300);
  };

  const handleProceed = () => {
    if (!selectedCategory) {
      toast.error('Please select a category', {
        icon: '⚠️',
      });
      return;
    }
    
    // Find the selected category object
    const selected = categories.find(cat => cat.id === selectedCategory);
    if (!selected) return;
    
    toast.success('Searching Reddit for this category!', {
      icon: '✅',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
    
    // Navigate to threads page with the category name as query
    setTimeout(() => {
      navigate(`/threads?query=${encodeURIComponent(selected.name)}`);
    }, 300);
  };

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

        {/* Page Title - Dynamic from search query */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {pageTitle}
            </h1>
            <p className="text-slate-400 text-lg mt-2">
              Explore trending topics and sub-categories
            </p>
          </div>
          
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 text-base shadow-lg">
                  1 category selected
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading State */}
        {isLoadingData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 text-lg">Loading results...</p>
          </motion.div>
        )}

        {/* Error State */}
        {hasError && !isLoadingData && (
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
              onClick={() => navigate('/dashboard')}
              className="rounded-full px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Back to Search
            </Button>
          </motion.div>
        )}

        {/* Category Cards Grid */}
        {!isLoadingData && !hasError && (
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 items-start"
          >
            {categories.map((cat) => {
            const isExpanded = expandedCards.has(cat.id);
            const isSelected = selectedCategory === cat.id;

            return (
              <motion.div
                key={cat.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleCategorySelection(cat.id)}
                className={cn(
                  'bg-slate-800/50 backdrop-blur-sm border-2 rounded-2xl p-6 transition-all self-start w-full relative cursor-pointer',
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' 
                    : 'border-slate-700 hover:border-cyan-500/50',
                  isExpanded && !isSelected && 'border-slate-600'
                )}
                style={{
                  maxHeight: isExpanded ? 'none' : 'fit-content',
                }}
              >
                {/* Selection Checkbox - Bigger and more visible */}
                <div className="absolute top-5 right-5 z-10">
                  <motion.div
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-md',
                      isSelected
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'bg-slate-700 border-slate-500 hover:border-cyan-400'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-5 w-5 font-bold" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Card Header */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardExpansion(cat.id);
                  }}
                  className="flex items-start justify-between mb-4 cursor-pointer pr-12 hover:opacity-80 transition-opacity"
                >
                  <h2 className="text-xl font-bold text-white pr-4 flex-1">
                    {cat.name}
                  </h2>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </div>

                {/* Card Body - Subcategories */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-2"
                    >
                      {cat.subcategories.map((subcat, subIndex) => (
                        <div key={subIndex} className="space-y-2">
                          {/* Subcategory - clickable to search Reddit */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Searching Reddit for: ${subcat.name}`, {
                                icon: '🔍',
                              });
                              setTimeout(() => {
                                navigate(`/threads?query=${encodeURIComponent(subcat.name)}`);
                              }, 300);
                            }}
                            className="flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors group cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            {subcat.name}
                          </div>

                          {/* Sub-niches - also clickable */}
                          {subcat.subNiches && (
                            <div className="pl-6 space-y-1">
                              {subcat.subNiches.map((niche, nicheIndex) => (
                                <div
                                  key={nicheIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Searching Reddit for: ${niche.name}`, {
                                      icon: '🔍',
                                    });
                                    setTimeout(() => {
                                      navigate(`/threads?query=${encodeURIComponent(niche.name)}`);
                                    }, 300);
                                  }}
                                  className="flex items-center justify-between text-sm text-slate-400 hover:text-cyan-300 transition-colors py-1 cursor-pointer"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-slate-600">–</span>
                                    {niche.name}
                                  </span>
                                  {niche.trend && (
                                    <span className="text-green-400 font-medium">
                                      {niche.trend}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Collapsed Preview */}
                {!isExpanded && (
                  <div className="text-sm text-slate-500 pointer-events-none">
                    {cat.subcategories.length} subcategories • Click chevron to expand
                  </div>
                )}
                
                {/* Selection Hint */}
                {!isSelected && (
                  <div className="absolute bottom-4 left-6 text-xs text-slate-600 pointer-events-none">
                    Click card to select
                  </div>
                )}
              </motion.div>
            );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoadingData && !hasError && categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-400 text-lg">
              No categories found
            </p>
            <Button
              onClick={handleBack}
              className="mt-4 rounded-full px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Back to Search
            </Button>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isLoadingData && !hasError && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-between items-center pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleBack}
                variant="outline"
                className="rounded-2xl px-8 py-6 bg-slate-700 hover:bg-slate-600 text-white shadow-xl border-0"
              >
                Go Back
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleProceed}
                disabled={!selectedCategory}
                className={cn(
                  'rounded-2xl px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
                  'text-white shadow-xl hover:shadow-2xl hover:shadow-cyan-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                )}
              >
                Proceed →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
  );
};

export default CategoriesPage;

