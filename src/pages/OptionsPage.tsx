import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OptionCard from '@/components/OptionCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFlowStore } from '@/store/flowStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, Target, Lightbulb, BarChart3, Users, DollarSign } from 'lucide-react';
import { PainPointCategory, PainPoint, FrameworkSolution, Solution, OpportunityAssessment } from '@/types';

const OptionsPage = () => {
  const navigate = useNavigate();
  const { selectedOption, setOption, reset, analysisResults, selectedThreads } = useFlowStore();
  const [localSelected, setLocalSelected] = useState<string | null>(selectedOption);
  const [hasAnalysisResults, setHasAnalysisResults] = useState(false);

  useEffect(() => {
    setHasAnalysisResults(!!analysisResults);
  }, [analysisResults]);

  const optionData = [
    {
      id: 'option-1',
      title: 'Basic Plan',
      description: 'Perfect for small teams and startups getting started',
      gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
      icon: 'database' as const,
    },
    {
      id: 'option-2',
      title: 'Professional Plan',
      description: 'Advanced features for growing businesses',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      icon: 'zap' as const,
    },
    {
      id: 'option-3',
      title: 'Enterprise Plan',
      description: 'Full-scale solution for large organizations',
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
      icon: 'globe' as const,
    },
  ];

  const handleOptionSelect = async (optionId: string) => {
    setLocalSelected(optionId);
    setOption(optionId);
    toast.success('Plan selected successfully!', {
      description: 'Your configuration has been saved.',
    });
    
    // Here you would typically submit the complete flow data
    // await apiService.submitOption({ selectedOption: optionId });
    
    // Reset the flow and navigate to dashboard or home
    setTimeout(() => {
      reset();
      navigate('/');
    }, 2000);
  };

  const handleBack = () => {
    navigate('/threads');
  };

  const handleBackToDashboard = () => {
    if (hasAnalysisResults) {
      // Navigate to landing page creation
      navigate('/landing-creation');
    } else {
    reset();
      navigate('/dashboard');
    }
  };

  // Render analysis results if available
  const renderAnalysisResults = () => {
    if (!analysisResults) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No analysis results available</p>
          <p className="text-slate-500 text-sm mt-2">Please select threads from the previous page</p>
        </motion.div>
      );
    }

    const painPoints = analysisResults.pain_points;
    const marketGaps = analysisResults.market_gaps;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Analysis Complete!</h3>
          </div>
          <p className="text-slate-300 ml-11">
            Successfully analyzed {selectedThreads.length} Reddit thread{selectedThreads.length > 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Three Main Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pain Points Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Pain Points</h3>
              </div>
              
              {painPoints && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {painPoints.summary}
                  </p>
                  
                  {painPoints.categories && painPoints.categories.map((category: PainPointCategory, index: number) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 group hover:p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                      <h4 className="text-white font-semibold mb-2 group-hover:mb-3 transition-all duration-300">{category.category_name}</h4>
                      <div className="space-y-2 group-hover:space-y-3 transition-all duration-300">
                        {category.pain_points.map((painPoint: PainPoint, pIndex: number) => (
                          <div key={pIndex} className="group/item">
                            <h5 className="text-orange-400 font-medium text-sm mb-1 group-hover/item:text-orange-300 transition-colors">
                              {painPoint.heading}
                            </h5>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-1 group-hover/item:line-clamp-3 transition-all duration-300">
                              {painPoint.summary}
                            </p>
                            {/* Show quotes on hover */}
                            <div className="mt-1 max-h-0 group-hover/item:max-h-20 overflow-hidden transition-all duration-300">
                              <div className="space-y-1 pt-1">
                                {painPoint.quotes.slice(0, 2).map((quote, qIndex) => (
                                  <p key={qIndex} className="text-slate-500 text-xs italic border-l-2 border-slate-600 pl-2">
                                    "{quote}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Market Gaps Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Market Gaps</h3>
              </div>
              
              {marketGaps && (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {marketGaps.executive_summary}
                  </p>
                  
                  {marketGaps.framework_solutions && marketGaps.framework_solutions.map((framework: FrameworkSolution, index: number) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 group hover:p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                      <h4 className="text-white font-semibold mb-2 group-hover:mb-3 transition-all duration-300">{framework.framework_name}</h4>
                      <div className="space-y-2 group-hover:space-y-3 transition-all duration-300">
                        {framework.solutions.map((solution: Solution, sIndex: number) => (
                          <div key={sIndex} className="group/item">
                            <h5 className="text-blue-400 font-medium text-sm mb-1 group-hover/item:text-blue-300 transition-colors">
                              {solution.name}
                            </h5>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-1 group-hover/item:line-clamp-3 transition-all duration-300">
                              {solution.explanation}
                            </p>
                            {/* Show key features on hover */}
                            <div className="max-h-0 group-hover/item:max-h-32 overflow-hidden transition-all duration-300">
                              <div className="space-y-2 pt-2">
                                <p className="text-slate-500 text-xs font-medium">Key Features:</p>
                                <div className="space-y-1">
                                  {solution.key_features.slice(0, 3).map((feature, fIndex) => (
                                    <p key={fIndex} className="text-slate-500 text-xs">
                                      • {feature}
                                    </p>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {solution.pain_points_addressed.map((point: string, pIndex: number) => (
                                    <Badge key={pIndex} variant="secondary" className="text-xs">
                                      {point}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Opportunities Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Opportunities</h3>
              </div>
              
              {marketGaps && marketGaps.opportunity_assessment && (
                <div className="space-y-4">
                  {marketGaps.opportunity_assessment.map((opportunity: OpportunityAssessment, index: number) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 group hover:p-4 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 group-hover:mb-3 transition-all duration-300">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 group-hover:bg-green-500/30 transition-colors">
                          #{opportunity.rank}
                        </Badge>
                        <h4 className="text-white font-semibold text-sm group-hover:text-green-100 transition-colors">
                          {opportunity.solution_name}
                        </h4>
                      </div>
                      
                      {/* Summary view - always visible */}
                      <div className="space-y-1 group-hover:space-y-2 transition-all duration-300 text-xs">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400">Market Size:</span>
                          <span className="text-slate-300 line-clamp-1">{opportunity.market_size_potential}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400">Feasibility:</span>
                          <span className="text-slate-300">{opportunity.implementation_feasibility}</span>
                        </div>
                      </div>
                      
                      {/* Detailed view - shown on hover */}
                      <div className="max-h-0 group-hover:max-h-24 overflow-hidden transition-all duration-300">
                        <div className="space-y-2 text-xs border-t border-slate-700 pt-2">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-slate-400 mt-0.5" />
                            <div>
                              <span className="text-slate-400">Advantage:</span>
                              <p className="text-slate-300 text-xs leading-relaxed mt-1">
                                {opportunity.competitive_advantage}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-3 w-3 text-slate-400 mt-0.5" />
                            <div>
                              <span className="text-slate-400">Potential:</span>
                              <p className="text-slate-300 text-xs leading-relaxed mt-1">
                                {opportunity.category_dominance_potential}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Selected Threads Info */}
        {selectedThreads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">Analyzed Threads</h4>
              <div className="space-y-3">
                {selectedThreads.map((thread, index) => (
                  <div
                    key={thread.id}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-orange-400 font-bold">{index + 1}.</span>
                      <div className="flex-1">
                        <h5 className="text-white font-medium line-clamp-2">{thread.title}</h5>
                        <p className="text-slate-400 text-sm mt-1">r/{thread.subreddit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
      <div className="max-w-7xl mx-auto space-y-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            {hasAnalysisResults ? 'Pain Points Analysis' : 'Choose Your Plan'}
        </h2>
          {hasAnalysisResults && (
            <p className="text-center text-slate-400">
              Review the analysis results from your selected Reddit threads
            </p>
          )}
        </motion.div>
        
        {hasAnalysisResults ? (
          renderAnalysisResults()
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {optionData.map((option) => (
            <OptionCard
              key={option.id}
              id={option.id}
              title={option.title}
              description={option.description}
              gradient={option.gradient}
              icon={option.icon}
              selected={localSelected === option.id}
              onClick={handleOptionSelect}
            />
          ))}
        </div>
        )}

        <div className="flex justify-between items-center pt-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleBack}
            variant="outline"
              className="rounded-2xl px-8 py-6 bg-slate-700 hover:bg-slate-600 text-white shadow-xl border-0 flex items-center gap-2"
          >
              <ArrowLeft className="h-4 w-4" />
              Back to Threads
          </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleBackToDashboard}
              className="rounded-2xl px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl transition-all"
          >
              {hasAnalysisResults ? 'Create Landing Page' : 'Back to Dashboard'}
          </Button>
          </motion.div>
        </div>
      </div>
  );
};

export default OptionsPage;
