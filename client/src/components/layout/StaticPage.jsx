export default function StaticPage({ title, subtitle, children }){
  return (
    <section className="py-20 px-6 text-center relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        {title && <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-center">{title}</h1>}
        {subtitle && <p className="mx-20 text-lg sm:text-xl text-text-secondary pb-8 text-center">{subtitle}</p>}
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  )
}
