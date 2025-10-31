import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFlowStore } from '@/store/flowStore';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Rocket, 
  TrendingUp, 
  Target, 
  Zap,
  DollarSign,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  Send,
  MessageSquare,
  Loader2,
  X,
  Maximize2,
  Download,
  Edit3
} from 'lucide-react';
import { Solution, OpportunityAssessment, FrameworkSolution, ChatMessage } from '@/types';

const LandingPageCreationPage = () => {
  const navigate = useNavigate();
  const { analysisResults } = useFlowStore();
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!analysisResults || !analysisResults.market_gaps) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <p className="text-slate-400 text-lg">No market gaps data available</p>
        <Button onClick={() => navigate('/options')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const { framework_solutions, opportunity_assessment } = analysisResults.market_gaps;

  // Flatten all solutions from all frameworks
  const allSolutions: Solution[] = [];
  framework_solutions.forEach((framework: FrameworkSolution) => {
    framework.solutions.forEach((solution: Solution) => {
      allSolutions.push(solution);
    });
  });

  // Find opportunity assessment for a given solution name
  const findOpportunity = (solutionName: string): OpportunityAssessment | undefined => {
    return opportunity_assessment.find(
      (opp: OpportunityAssessment) => opp.solution_name === solutionName
    );
  };

  const handleSelectSolution = (solution: Solution) => {
    setSelectedSolution(solution);
    
    // Initialize chat with solution context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Solution selected: ${solution.name}\n\nExplanation: ${solution.explanation}\n\nValue Proposition: ${solution.value_proposition}\n\nYou can now customize this solution by typing modifications, additions, or specific instructions below.`,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: `Great choice! I'll help you create a landing page for "${solution.name}".\n\nKey features:\n${solution.key_features.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nHow would you like to customize this landing page? You can:\n- Change the tone or style\n- Add specific sections\n- Modify pricing or features\n- Add testimonials or social proof\n- Customize the design\n\nJust type your instructions below!`,
      timestamp: new Date(),
    };

    setChatMessages([systemMessage, assistantMessage]);
    setInputMessage('');
    
    toast.success(`Selected: ${solution.name}`, {
      icon: '🎯',
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedSolution) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Simulate assistant response (in production, this could be an AI API call)
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        role: 'assistant',
        content: `Got it! I'll incorporate "${inputMessage}" into your landing page design. Feel free to add more customizations or click "Create Landing Page" when you're ready.`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantResponse]);
    }, 500);
  };

  const handleCreateWebsite = async () => {
    if (!selectedSolution) {
      toast.error('Please select a solution first');
      return;
    }

    if (chatMessages.length === 0) {
      toast.error('Please add customization instructions in the chat');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('Creating your landing page...', {
      icon: '🚀',
    });

    try {
      const opportunity = findOpportunity(selectedSolution.name);
      
      const response = await apiService.createWebsite({
        selected_solution: selectedSolution,
        chat_messages: chatMessages,
        opportunity_data: opportunity,
      });

      toast.dismiss(loadingToast);
      toast.success('Landing page created successfully!', {
        icon: '✨',
        duration: 3000,
      });

      // Store the generated website HTML or URL
      setGeneratedWebsite(response.data.website_html || response.data.website_url || '<h1>Website Created!</h1>');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : 'Failed to create website', {
        icon: '❌',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    navigate('/options');
  };

  const handleCloseWebsite = () => {
    setGeneratedWebsite(null);
    setIsFullScreen(false);
  };

  const handleDownloadWebsite = () => {
    if (!generatedWebsite) return;
    
    const blob = new Blob([generatedWebsite], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSolution?.name.replace(/\s+/g, '-').toLowerCase()}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Website downloaded!', { icon: '📥' });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Target className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 3:
        return <Zap className="h-5 w-5 text-purple-400" />;
      default:
        return <Rocket className="h-5 w-5 text-green-400" />;
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-orange-500';
      case 2:
        return 'from-blue-500 to-cyan-500';
      case 3:
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-green-500 to-emerald-500';
    }
  };

  const toggleExpand = (solutionName: string) => {
    setExpandedSolution(expandedSolution === solutionName ? null : solutionName);
  };

  // Website Preview Modal
  if (generatedWebsite) {
    return (
      <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'max-w-7xl mx-auto py-8 px-4'}`}>
        <div className={`${isFullScreen ? 'h-full' : 'h-[80vh]'} flex flex-col bg-slate-900 rounded-2xl overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="text-white font-semibold">Landing Page Created</h3>
                <p className="text-slate-400 text-sm">{selectedSolution?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsFullScreen(!isFullScreen)}
                variant="outline"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              
              <Button
                onClick={handleDownloadWebsite}
                variant="outline"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={handleCloseWebsite}
                variant="outline"
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Further
              </Button>
              
              <Button
                onClick={handleCloseWebsite}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Website Preview */}
          <div className="flex-1 bg-white overflow-hidden">
            <iframe
              srcDoc={generatedWebsite}
              className="w-full h-full border-0"
              title="Generated Landing Page"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-800 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Landing Page Creation
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Select a solution and customize it with chat
            </p>
          </div>
          
          <Button
            onClick={handleBack}
            variant="outline"
            className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
        </div>
      </motion.div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Solutions Grid */}
        <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-cyan-400" />
              Available Solutions
            </h3>
            
            <div className="space-y-4">
              {allSolutions.map((solution: Solution, index: number) => {
                const opportunity = findOpportunity(solution.name);
                const isSelected = selectedSolution?.name === solution.name;
                const isExpanded = expandedSolution === solution.name;

                return (
                  <motion.div
                    key={`${solution.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-orange-500 bg-slate-800/70 shadow-lg shadow-orange-500/20'
                          : 'border border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onClick={() => handleSelectSolution(solution)}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      <CardHeader className="pb-3">
                        {opportunity && (
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`bg-gradient-to-r ${getRankGradient(opportunity.rank)} text-white border-0 text-xs`}>
                              Rank #{opportunity.rank}
                            </Badge>
                            {getRankIcon(opportunity.rank)}
                          </div>
                        )}

                        <CardTitle className="text-lg text-white leading-tight">
                          {solution.name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                          {solution.explanation}
                        </p>

                        {/* Quick Info */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {solution.business_model.split(' ').slice(0, 3).join(' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {solution.key_features.length} features
                          </Badge>
                        </div>

                        {/* Expand/Collapse */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(solution.name);
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 pt-2 border-t border-slate-700">
                                <p className="text-slate-400 text-xs">
                                  <strong>Value:</strong> {solution.value_proposition}
                                </p>
                                <div>
                                  <p className="text-slate-400 text-xs font-semibold mb-1">Key Features:</p>
                                  <ul className="space-y-0.5">
                                    {solution.key_features.slice(0, 3).map((feature, idx) => (
                                      <li key={idx} className="text-slate-400 text-xs flex items-start gap-1">
                                        <span className="text-green-500 mt-0.5">•</span>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="w-1/2 flex flex-col bg-slate-900/50">
          {!selectedSolution ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  Select a Solution
                </h3>
                <p className="text-slate-500 text-sm max-w-md">
                  Choose a solution from the left to start customizing your landing page through an interactive chat
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Customize Your Landing Page</h3>
                      <p className="text-slate-400 text-xs">{selectedSolution.name}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.map((message, index) => (
                  message.role !== 'system' && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-orange-100' : 'text-slate-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  )
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-800 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your customization instructions..."
                    className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
                    disabled={isCreating}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isCreating}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateWebsite}
                  disabled={!selectedSolution || chatMessages.length === 0 || isCreating}
                  className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Landing Page...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 mr-2" />
                      Create Landing Page
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPageCreationPage;
