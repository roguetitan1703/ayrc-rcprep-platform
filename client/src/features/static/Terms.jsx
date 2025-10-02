import content from '../../content/static.json'
import StaticPage from '../../components/layout/StaticPage'
import { FileText } from "lucide-react";

export default function Terms(){
  const t = content.tos
  return (
    <StaticPage>
       <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-6 text-text-primary">{t.title}</h1>
      <p className="max-w-4xl mx-auto text-lg font-medium mt-6 text-text-secondary">{t.body}</p>
      
     
       <div className="text-left space-y-6 max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-semibold text-text-primary">Use of Platform</h2>
          <p className='text-text-secondary'>
            ARC RC Prep is intended for aspirants preparing for competitive exams. 
            Any misuse, including sharing content illegally, is strictly prohibited.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">Account Responsibility</h2>
          <p className='text-text-secondary'>
            You are responsible for maintaining confidentiality of your account credentials. 
            We are not liable for unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">Limitation of Liability</h2>
          <p className='text-text-secondary'>
            While we strive for accuracy, ARC RC Prep does not guarantee error-free content. 
            We are not responsible for exam outcomes or third-party losses.
          </p>
        <h2 className="text-2xl font-semibold text-text-primary">Pilot Project Disclaimer</h2>
          <p className='text-text-secondary'>
            ARC is currently a pilot initiative. Features and functionalities are subject 
            to change as we improve the platform based on feedback and testing.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">Content Usage</h2>
          <p className='text-text-secondary'>
            All materials on ARC RC Prep are for personal preparation only. Redistribution, 
            reproduction, or commercial use of the content is strictly prohibited.
          </p>

          <h2 className="text-2xl font-semibold text-text-primary">Contact Information</h2>
          <p className='text-text-secondary'>
            For any queries or issues, please refer to the contact details provided in our README file. 
            Our team will be happy to assist you.
          </p>
        </div>
    </StaticPage>
  )
}
