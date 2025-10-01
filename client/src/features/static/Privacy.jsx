import StaticPage from '../../components/layout/StaticPage'
import content from '../../content/static.json'
import { Shield } from "lucide-react";

export default function Privacy() {
  const c = content.privacy
  return (
    <StaticPage>
     <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 text-text-primary">
         {c.title}
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
         {c.subtitle}
        </p>
        <p className="text-lg text-text-secondary mt-4 pt-4 max-w-2xl mx-auto">
          We respect your privacy and are committed to protecting your personal data.
        </p>

        <div className="text-left space-y-6 mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-text-primary">Data We Collect</h2>
          <p className='text-text-secondary'>
            We collect basic personal information such as name, email, and usage data to improve the service.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2 text-text-secondary">
            <li>To personalize your RC practice experience</li>
            <li>To provide analytics and insights</li>
            <li>To improve platform performance and reliability</li>
          </ul>

          <h2 className="text-2xl font-semibold text-text-primary">Data Security</h2>
          <p className='text-text-secondary'>
            We use encryption and secure servers to protect your data. 
            However, no system is 100% secure — please use ARC responsibly.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">Your Rights</h2>
          <p className='text-text-secondary'>
            You may request access, correction, or deletion of your personal data at any time by contacting support.
          </p>
        </div>
    </StaticPage>
  )
}
