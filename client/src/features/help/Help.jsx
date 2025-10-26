import React, { useState , useEffect} from 'react'
import { Search, ChevronDown, ChevronRight, BookOpen, Target, Award, CreditCard, AlertCircle, HelpCircle, Star } from 'lucide-react'
// Layout is handled by App (StaticNavbar/Footer or Shell). Help renders content only.
import content from '../../content/static.json'
import helpData from '../../content/help.json'
import { useLocation } from 'react-router-dom'

// Load help content from JSON and attach UI metadata (icons/colors)
const sectionMeta = {
  'getting-started': { icon: BookOpen, color: '#3B82F6' },
  'features': { icon: Target, color: '#23A094' },
  'scoring': { icon: Award, color: '#F6B26B' },
  'subscription': { icon: CreditCard, color: '#D33F49' },
  'troubleshooting': { icon: AlertCircle, color: '#E4572E' },
  'faq': { icon: HelpCircle, color: '#8B5CF6' }
}

// Helper to replace placeholders in article text with runtime values
const replacePlaceholders = (text = '') => {
  return text
    .replace(/{{platformName}}/g, content.platformName || '')
    .replace(/{{supportEmail}}/g, content.contact?.supportEmail || '')
    .replace(/{{responseTime}}/g, content.contact?.responseTime || '')
}

const helpSections = (helpData.sections || []).map(section => ({
  ...section,
  icon: sectionMeta[section.id]?.icon || BookOpen,
  color: sectionMeta[section.id]?.color || '#dddddd',
  articles: (section.articles || []).map(a => ({ title: a.title, content: replacePlaceholders(a.content) }))
}))

const popularArticles = helpData.popularArticles || []

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState('getting-started')
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [isDashboard, setIsDashboard] = useState(false)
  const location = useLocation()

  // ✅ Detect if opened inside dashboard (Shell)
  useEffect(() => {
    // Simple heuristic: if path starts with /dashboard, /test, etc. it’s inside app shell
    const dashboardPaths = [
      '/dashboard',
      '/attempts',
      '/archive',
      '/performance',
      '/subscriptions',
      '/profile',
      '/leaderboard',
    ]
    const inside = dashboardPaths.some((path) => location.pathname.startsWith(path))
    setIsDashboard(inside)
  }, [location])


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

  const fmtViews = (n) => {
    if (!n && n !== 0) return ''
    if (n < 1000) return `${n} views`
    if (n < 1000000) return `${(n/1000).toFixed(n % 1000 === 0 ? 0 : 1)}k views`
    return `${(n/1000000).toFixed(1)}M views`
  }

  const HelpContent = (
    <div className="space-y-6">
      {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Help Center</h1>
            <p className="text-text-secondary mt-2">Find answers to common questions and learn how to use {content.platformName} effectively</p>
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
          <div className="bg-card-surface border border-border-soft rounded-xl p-6">
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
                    <span className="text-xs text-text-secondary">{fmtViews(article.views)}</span>
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
              <a href={`mailto:${content.contact.supportEmail}`} className="inline-block w-full text-center px-4 py-2 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  )
    // Help content only — App decides which layout (static navbar/footer or Shell) to render.
    // When opened inside the dashboard shell we return content raw (Shell provides padding/layout).
    // When opened as a public/static page, wrap with the same padding other static pages get.
    return isDashboard ? (
      HelpContent
    ) : (
      <div className="px-6 py-8 mx-auto max-w-7xl">{HelpContent}</div>
    )

}
