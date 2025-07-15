import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  // Icons for UI elements
  Mail,
  Check,
  X,
  Zap,
  ShieldCheck,
  Rocket,
  ListChecks,
  BarChart2,
  Code2,
  Cpu,
  Server,
  Database,
  Cloud,
  GitBranch,
  Clock,
  Users,
  Target,
  Award
} from "lucide-react"
import Link from "next/link"

const upcomingSkills = [
  {
    name: "LLM Development",
    category: "AI/ML",
    icon: "🧠",
    status: "Coming Soon",
    description: "Master building and fine-tuning large language models for various applications"
  },
  {
    name: "AI Product Management",
    category: "Business",
    icon: "📈",
    status: "Coming Soon",
    description: "Learn to manage AI products and bring them successfully to market"
  },
  {
    name: "Generative AI",
    category: "AI/ML",
    icon: "🎨",
    status: "Coming Soon",
    description: "Create AI systems that generate text, images, and more"
  },
  {
    name: "Business Strategy",
    category: "Management",
    icon: "♟️",
    status: "Coming Soon",
    description: "Develop winning business strategies in the age of AI"
  },
  {
    name: "UX/UI for AI",
    category: "Design",
    icon: "✨",
    status: "Coming Soon",
    description: "Design intuitive interfaces for AI-powered applications"
  },
  {
    name: "AI Ethics",
    category: "Business",
    icon: "⚖️",
    status: "Coming Soon",
    description: "Navigate the ethical considerations of AI implementation"
  },
]

const skillCategories = [
  { 
    name: "AI/ML Engineering", 
    count: "15+", 
    icon: <Code2 className="w-6 h-6" />,
    description: "Build and deploy cutting-edge AI and machine learning solutions"
  },
  { 
    name: "Business & Strategy", 
    count: "10+", 
    icon: <BarChart2 className="w-6 h-6" />,
    description: "Develop business acumen and strategic thinking for the AI era"
  },
  { 
    name: "Product Management", 
    count: "8+", 
    icon: <Target className="w-6 h-6" />,
    description: "Lead successful AI product development and go-to-market strategies"
  },
  { 
    name: "UX/UI Design", 
    count: "12+", 
    icon: <Award className="w-6 h-6" />,
    description: "Create intuitive and engaging user experiences for AI applications"
  },
  { 
    name: "Data Science", 
    count: "9+", 
    icon: <Database className="w-6 h-6" />,
    description: "Extract insights and build data-driven solutions"
  },
  { 
    name: "AI Ethics & Governance", 
    count: "6+", 
    icon: <ShieldCheck className="w-6 h-6" />,
    description: "Navigate the ethical and regulatory landscape of AI"
  },
]

export default function SkillHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <span className="text-gray-400 font-medium cursor-not-allowed">Skills</span>
                <span className="text-gray-400 font-medium cursor-not-allowed">Contests</span>
                <span className="text-gray-400 font-medium cursor-not-allowed">Leaderboard</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-400 font-medium cursor-not-allowed" disabled>
                Login
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 font-medium">
                Get Notified
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-400 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-500 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-indigo-500 rounded-full animate-float animation-delay-3000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-indigo-200 mb-6 animate-pulse">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              🚀 Join 1,000+ waitlist
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Future Belongs to Those Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Prove Their Skills</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              In a world of AI and automation, your skills are your currency. Stand out with verifiable expertise that employers trust and respect.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-16">
              <div className="relative flex-1">
                <label htmlFor="email" className="sr-only">Email address</label>
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-300" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Your best email"
                  aria-label="Enter your email for early access"
                  className="pl-12 pr-4 py-4 bg-white/10 border-0 text-white placeholder-indigo-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 w-full"
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
              >
                Get Early Access
              </Button>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="text-indigo-200 text-sm mb-4">Be among the first to join our growing community</p>
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Early Adopter Benefits:</span>
              </div>
              <ul className="mt-2 text-indigo-100 text-sm space-y-1 text-center">
                <li>• Exclusive early access to new features</li>
                <li>• Special founding member pricing</li>
                <li>• Direct influence on our roadmap</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ListChecks className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Testing</h3>
                <p className="text-indigo-100 text-sm">Rigorous assessments covering all aspects of your domain expertise</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheck className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Verified Credentials</h3>
                <p className="text-indigo-100 text-sm">Earn trusted certifications that validate your skills</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart2 className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Skill Benchmarking</h3>
                <p className="text-indigo-100 text-sm">See how you compare to industry standards and peers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 mb-6">
            🚫 No More Empty Certificates
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Real Skills. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Real Recognition.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            At WorkZen, we're redefining what it means to be certified in the age of AI and digital transformation.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">The Old Way</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Participation trophies disguised as certifications</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Multiple-choice tests that don't prove real skills</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Certificates that don't translate to job performance</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                The WorkZen Difference
              </div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Real Certification</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rigorous, hands-on assessments that prove real ability</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Industry-aligned skills that employers actually value</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verifiable proof of what you can actually do</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 bg-indigo-50 p-6 rounded-xl max-w-3xl mx-auto">
            <p className="text-lg font-medium text-indigo-900 mb-4">
              "We don't certify attendance. We certify ability."
            </p>
            <p className="text-gray-700">
              In a world drowning in meaningless credentials, we're bringing back the true value of certification. 
              No shortcuts. No fluff. Just verified talent that stands out in the real world.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-full mb-4">
              High-Demand Skills
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Skills That Drive Careers Forward</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most sought-after skills in today's job market, verified by industry experts
            </p>
          </div>
          
          {/* Skills Demand Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '87%', label: 'of hiring managers prioritize skills over degrees' },
              { value: '3.5x', label: 'more job opportunities for certified professionals' },
              { value: '92%', label: 'higher interview rate with verified skills' },
              { value: '2.1x', label: 'faster career progression' },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center">
                <p className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingSkills.map((skill, index) => {
              const icons = {
                'Programming': <Code2 className="w-6 h-6" />,
                'Frontend': <Cpu className="w-6 h-6" />,
                'Backend': <Server className="w-6 h-6" />,
                'Database': <Database className="w-6 h-6" />,
                'Cloud': <Cloud className="w-6 h-6" />,
                'DevOps': <GitBranch className="w-6 h-6" />
              };
              
              return (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600">
                          {icons[skill.category as keyof typeof icons] || <Code2 className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                          <span className="text-sm font-medium text-purple-600">{skill.category}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {skill.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Coming Soon</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Join Waitlist</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.random() * 30 + 20}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Progress</span>
                      <span>Early Access</span>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <button className="w-full py-3 px-4 text-center text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200">
                      Get Notified
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Skill Categories Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full mb-4">
              Comprehensive Learning
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Skill Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive into our comprehensive range of technology areas to find the perfect skills to master
            </p>
          </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skillCategories.map((category, index) => {
              const categoryIcons = {
                'AI/ML Engineering': <Cpu className="w-8 h-8 text-indigo-600" />,
                'Business & Strategy': <BarChart2 className="w-8 h-8 text-indigo-600" />,
                'Product Management': <Target className="w-8 h-8 text-indigo-600" />,
                'UX/UI Design': <Award className="w-8 h-8 text-indigo-600" />,
                'Data Science': <Database className="w-8 h-8 text-indigo-600" />,
                'AI Ethics & Governance': <ShieldCheck className="w-8 h-8 text-indigo-600" />
              };
              
              const categoryDescriptions = {
                'AI/ML Engineering': 'Build and deploy cutting-edge AI and machine learning solutions',
                'Business & Strategy': 'Develop business acumen and strategic thinking for the AI era',
                'Product Management': 'Lead successful AI product development and go-to-market strategies',
                'UX/UI Design': 'Create intuitive and engaging user experiences for AI applications',
                'Data Science': 'Extract insights and build data-driven solutions',
                'AI Ethics & Governance': 'Navigate the ethical and regulatory landscape of AI'
              };
              
              return (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                      {categoryIcons[category.name as keyof typeof categoryIcons] || <Code2 className="w-8 h-8" />}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                    <p className="text-gray-600 mb-6">
                      {categoryDescriptions[category.name as keyof typeof categoryDescriptions]}
                    </p>
                    
                    <div className="flex items-center text-sm text-indigo-600 font-medium">
                      <span>Explore {category.count} skills</span>
                      <svg 
                        className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to level up your skills?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our waitlist to get early access and be the first to know when we launch new skill assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full mb-4">
              Our Vision
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Redefining Skill Validation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building a new standard for proving your skills in the age of AI and automation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-indigo-600 mb-4" />,
                title: "Real Skills, Not Just Certificates",
                description: "We focus on practical, hands-on assessments that prove you can actually do the work, not just pass a test."
              },
              {
                icon: <Users className="w-8 h-8 text-indigo-600 mb-4" />,
                title: "Built With Industry",
                description: "Our assessments are designed with input from hiring managers and industry experts to ensure they test what matters most."
              },
              {
                icon: <Rocket className="w-8 h-8 text-indigo-600 mb-4" />,
                title: "Future-Proof Your Career",
                description: "Stay ahead of the curve with skills that will be in demand as AI transforms the workforce."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Be Part of Our Journey</h3>
            <p className="text-gray-600 mb-6">
              We're just getting started, and we're looking for forward-thinking professionals to help shape the future of skill validation.
              Join our waitlist to get early access and help us build something truly valuable.
            </p>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg"
            >
              Join Waitlist
            </Button>
          </div>
          
          {/* Growing Community */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 text-sm mb-2">JOIN OUR GROWING COMMUNITY OF</p>
            <div className="text-4xl font-bold text-indigo-600 mb-6">1,000+ Professionals</div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our members come from startups to Fortune 500 companies, all committed to advancing their skills in the AI era.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {['Startup Founders', 'Product Managers', 'AI Engineers', 'UX Designers', 'Data Scientists', 'Tech Leaders'].map((role, index) => (
                <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Be Part of Our Journey</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            We're building the future of skill validation, and we want you with us from the start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg" 
              className="bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Join Waitlist
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 font-medium py-4 px-8 rounded-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
          <p className="mt-4 text-indigo-200 text-sm">
            Limited early access spots available. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="WorkZen Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen Skills</span>
              </div>
              <p className="text-gray-500 text-sm">
                Empowering professionals with validated skills for the digital economy.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Roadmap</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500"> {new Date().getFullYear()} WorkZen Skills. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
