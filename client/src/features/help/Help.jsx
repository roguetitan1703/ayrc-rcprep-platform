import React, { useState } from 'react'
import { Search, ChevronDown, ChevronRight, BookOpen, Target, Award, CreditCard, AlertCircle, HelpCircle, Star } from 'lucide-react'

// Help content data
const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: '#3B82F6',
    articles: [
      {
        title: 'How to create an account',
        content: 'Click "Sign Up" on the homepage, fill in your details (name, email, phone, password), and verify your email. You\'ll be automatically logged in and redirected to your dashboard.'
      },
      {
        title: 'Taking your first RC test',
        content: 'Navigate to "Test" from the sidebar or dashboard. Click "Start New Test" to begin. Read the passage carefully, answer all questions, and click "Submit" when done. Your results will be available immediately in the Analysis page.'
      },
      {
        title: 'Understanding the dashboard',
        content: 'Your dashboard shows key metrics: Total Attempts, 7-day Accuracy, Reason Coverage, Topic Distribution (ring charts), and Activity Graph (12-week heatmap). Use these insights to track your progress and identify areas for improvement.'
      },
      {
        title: 'Navigating the platform',
        content: 'Use the left sidebar to access all features: Dashboard (overview), Test (new attempts), Results (history), Analysis (detailed breakdown), Archive (saved passages), Insights (performance studio), Profile (account settings), and Help.'
      }
    ]
  },
  {
    id: 'features',
    title: 'Features Guide',
    icon: Target,
    color: '#23A094',
    articles: [
      {
        title: 'Dashboard analytics explained',
        content: 'The dashboard displays: (1) Stats Row - attempts, accuracy, coverage; (2) Topic Rings - question distribution by topic (30 days); (3) Activity Graph - daily practice heatmap (12 weeks). All data updates in real-time after each test.'
      },
      {
        title: 'Using the Analysis page',
        content: 'After each test, the Analysis page shows: Score, Time, Correct count, Avg time per question, Speed tier, Question-level breakdown (correct/incorrect), Reason tagging, Coverage meter, and Category accuracy table. Tag reasons for incorrect answers to track patterns.'
      },
      {
        title: 'Archive & favorites',
        content: 'The Archive page shows all available RC passages in a premium card grid. Filter by topic, difficulty, or search by keywords. Click any card to start a test with that passage. Favorites feature coming soon!'
      },
      {
        title: 'Results & history',
        content: 'The Results page shows all your past attempts with: Date, Score, Time, Topics, and Quick stats (7-day attempts, accuracy, avg duration, reason coverage). Click any row to view detailed analysis.'
      },
      {
        title: 'Performance Studio (Insights)',
        content: 'The Insights page (Performance Studio) provides advanced analytics: Overview metrics, Question type breakdown, Progress timeline, Radar chart, and Export to CSV. Currently requires an active subscription.'
      }
    ]
  },
  {
    id: 'scoring',
    title: 'Scoring & Analysis',
    icon: Award,
    color: '#F6B26B',
    articles: [
      {
        title: 'How scoring works',
        content: 'Your score is calculated as: (Correct Answers / Total Questions) × 100. Each question has equal weight. Time taken does not affect your score, but faster times with high accuracy improve your leaderboard rank.'
      },
      {
        title: 'Understanding reason tags',
        content: 'Reason tags help you identify why you got questions wrong. Common reasons: Misread passage, Missed detail, Wrong inference, Time pressure, Vocabulary gap. Tag all incorrect answers to track your error patterns over time.'
      },
      {
        title: 'Coverage meter explained',
        content: 'Coverage shows the percentage of your incorrect answers that have been tagged with reasons. Higher coverage (80%+) means better error tracking, which leads to more actionable insights and faster improvement.'
      },
      {
        title: 'Speed tiers and timing',
        content: 'Speed tiers: Fast (<90s/question), Medium (90-120s/question), Slow (>120s/question). Ideal target: 90-110s per question with 80%+ accuracy. Track your avg time per question in the Analysis page.'
      },
      {
        title: 'Category accuracy breakdown',
        content: 'The Category Accuracy Table shows your performance across question types: Inference, Detail, Main Idea, Author\'s Purpose, Vocabulary, etc. Identify weak categories and practice specifically on those topics.'
      }
    ]
  },
  {
    id: 'subscription',
    title: 'Subscription & Billing',
    icon: CreditCard,
    color: '#D33F49',
    articles: [
      {
        title: 'Subscription plans',
        content: 'ARC offers Free and Premium plans. Free: Basic analytics, limited tests per day. Premium: Unlimited tests, Performance Studio, Advanced insights, Priority support. Visit Subscriptions page for pricing.'
      },
      {
        title: 'Payment methods',
        content: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay. All payments are secure and encrypted. You\'ll receive an instant email confirmation after successful payment.'
      },
      {
        title: 'Managing your subscription',
        content: 'View your subscription status, plan details, start/expiry dates in Profile > Subscription card. To upgrade or cancel, click "Manage Subscription" or contact support. Cancellations take effect at the end of your billing cycle.'
      },
      {
        title: 'Subscription expiration',
        content: 'You\'ll receive email reminders 7 and 1 days before expiration. After expiration, your account reverts to Free plan. All your data (tests, analysis, history) is preserved. Resubscribe anytime to regain Premium features.'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertCircle,
    color: '#E4572E',
    articles: [
      {
        title: 'Login issues',
        content: 'If you can\'t log in: (1) Verify your email/password, (2) Clear browser cache and cookies, (3) Try incognito mode, (4) Reset password via "Forgot Password" link. If issues persist, contact support with your registered email.'
      },
      {
        title: 'Test not loading',
        content: 'If a test won\'t load: (1) Check your internet connection, (2) Refresh the page (Ctrl+F5), (3) Try a different browser, (4) Disable browser extensions temporarily. If the issue persists, the passage may be temporarily unavailable—try another one.'
      },
      {
        title: 'Results not showing',
        content: 'If results don\'t appear after submission: (1) Wait 30 seconds and refresh, (2) Check Results page directly, (3) Verify test was fully submitted (you should see confirmation message). If still missing, contact support with attempt date/time.'
      },
      {
        title: 'Analytics not updating',
        content: 'Analytics update in real-time after each test. If data seems stale: (1) Refresh the page, (2) Log out and back in, (3) Clear browser cache. Dashboard metrics aggregate from your last 7/30 days of activity.'
      },
      {
        title: 'Password reset',
        content: 'Click "Forgot Password" on login page. Enter your registered email. You\'ll receive a reset link within 5 minutes. Click the link and set a new password (8+ characters, mix of letters and numbers).'
      }
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    color: '#8B5CF6',
    articles: [
      {
        title: 'How many tests can I take per day?',
        content: 'Free users: Up to 3 tests per day. Premium users: Unlimited tests. Daily limits reset at midnight IST. Upgrade to Premium for unlimited practice and advanced analytics.'
      },
      {
        title: 'Can I retake the same passage?',
        content: 'Yes! You can retake any passage multiple times. Each attempt is recorded separately in your Results history. Use retakes to practice speed, test different strategies, or improve your score on difficult passages.'
      },
      {
        title: 'How is the leaderboard calculated?',
        content: 'Leaderboards rank users by: (1) Today - accuracy + time for today\'s attempts, (2) Monthly - cumulative accuracy + total time this month, (3) Tag-Wise - performance on specific topics. Rankings update in real-time.'
      },
      {
        title: 'What is Daily Streak?',
        content: 'Your Daily Streak tracks consecutive days you\'ve completed at least one test. Maintain your streak by practicing daily! Streaks reset if you miss a day. Your longest streak is saved in your profile.'
      },
      {
        title: 'How do I contact support?',
        content: 'Email us at support@arcprep.com or use the feedback form (Dashboard > Daily Feedback). We respond within 24 hours (faster for Premium users). Include your registered email and detailed description of the issue.'
      },
      {
        title: 'Is my data private and secure?',
        content: 'Yes! We use industry-standard encryption for all data. Your personal information and test results are never shared with third parties. Read our Privacy Policy for details. You can request data deletion anytime via support.'
      }
    ]
  }
]

const popularArticles = [
  { section: 'getting-started', index: 1, views: 1240 },
  { section: 'features', index: 1, views: 980 },
  { section: 'scoring', index: 0, views: 850 },
  { section: 'faq', index: 0, views: 720 },
  { section: 'troubleshooting', index: 0, views: 650 }
]

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState('getting-started')
  const [expandedArticle, setExpandedArticle] = useState(null)

  // Filter sections and articles based on search
  const filteredSections = helpSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0 || searchQuery === '')

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const toggleArticle = (sectionId, articleIndex) => {
    const articleId = `${sectionId}-${articleIndex}`
    setExpandedArticle(expandedArticle === articleId ? null : articleId)
  }

  // Get popular articles data
  const getPopularArticleData = () => {
    return popularArticles.map(({ section, index, views }) => {
      const sectionData = helpSections.find(s => s.id === section)
      const article = sectionData?.articles[index]
      return { ...article, sectionTitle: sectionData?.title, sectionId: section, index, views }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Help Center</h1>
        <p className="text-text-secondary mt-2">Find answers to common questions and learn how to use ARC effectively</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card-surface border border-border-soft rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Help Sections */}
        <div className="lg:col-span-2 space-y-4">
          {filteredSections.length === 0 ? (
            <div className="bg-card-surface border border-border-soft rounded-xl p-12 text-center">
              <p className="text-text-secondary">No articles found matching "{searchQuery}"</p>
              <p className="text-sm text-text-secondary mt-2">Try different keywords or browse categories below</p>
            </div>
          ) : (
            filteredSections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSection === section.id
              
              return (
                <div key={section.id} className="bg-card-surface border border-border-soft rounded-xl overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-surface-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: `${section.color}15` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: section.color }} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-text-secondary">{section.articles.length} articles</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-text-secondary" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-text-secondary" />
                    )}
                  </button>

                  {/* Articles List */}
                  {isExpanded && (
                    <div className="border-t border-border-soft">
                      {section.articles.map((article, idx) => {
                        const articleId = `${section.id}-${idx}`
                        const isArticleExpanded = expandedArticle === articleId

                        return (
                          <div key={idx} className="border-b border-border-soft last:border-b-0">
                            <button
                              onClick={() => toggleArticle(section.id, idx)}
                              className="w-full p-4 flex items-center justify-between hover:bg-surface-muted/30 transition-colors text-left group"
                            >
                              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors flex-1">
                                {article.title}
                              </span>
                              {isArticleExpanded ? (
                                <ChevronDown className="h-4 w-4 text-text-secondary ml-2 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-text-secondary ml-2 flex-shrink-0" />
                              )}
                            </button>
                            
                            {isArticleExpanded && (
                              <div className="px-4 pb-4 bg-surface-muted/20">
                                <p className="text-sm text-text-secondary leading-relaxed">
                                  {article.content}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar - Popular Articles */}
        <div className="space-y-6">
          <div className="bg-card-surface border border-border-soft rounded-xl p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-accent-amber" />
              <h3 className="text-lg font-semibold text-text-primary">Popular Articles</h3>
            </div>
            <div className="space-y-3">
              {getPopularArticleData().map((article, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExpandedSection(article.sectionId)
                    setExpandedArticle(`${article.sectionId}-${article.index}`)
                    // Smooth scroll to section
                    setTimeout(() => {
                      document.getElementById(article.sectionId)?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-surface-muted transition-colors group"
                >
                  <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary">{article.sectionTitle}</span>
                    <span className="text-xs text-text-secondary">•</span>
                    <span className="text-xs text-text-secondary">{article.views} views</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Still need help?</h3>
            <p className="text-sm text-text-secondary mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="mailto:support@arcprep.com"
              className="inline-block w-full text-center px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
