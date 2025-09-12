export default function StaticPage({ title, subtitle, children }){
  return (
    <section className="py-10">
      <div className="max-w-3xl mx-auto">
        {title && <h1 className="text-2xl md:text-3xl font-semibold mb-1">{title}</h1>}
        {subtitle && <p className="text-text-secondary mb-6">{subtitle}</p>}
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  )
}
