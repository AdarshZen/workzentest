import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, Users, Trophy, Target, Award, Construction, Rocket, Bell } from "lucide-react"
import Link from "next/link"

const upcomingSkills = [
  {
    name: "Python",
    category: "Programming",
    icon: "🐍",
    status: "Coming Soon",
  },
  {
    name: "JavaScript",
    category: "Programming",
    icon: "⚡",
    status: "Coming Soon",
  },
  {
    name: "React",
    category: "Frontend",
    icon: "⚛️",
    status: "Coming Soon",
  },
  {
    name: "Node.js",
    category: "Backend",
    icon: "🟢",
    status: "Coming Soon",
  },
  {
    name: "SQL",
    category: "Database",
    icon: "🗄️",
    status: "Coming Soon",
  },
  {
    name: "AWS",
    category: "Cloud",
    icon: "☁️",
    status: "Coming Soon",
  },
]

const skillCategories = [
  { name: "Programming", count: "12+", icon: "💻" },
  { name: "Frontend", count: "8+", icon: "🎨" },
  { name: "Backend", count: "10+", icon: "⚙️" },
  { name: "Database", count: "6+", icon: "🗄️" },
  { name: "Cloud", count: "7+", icon: "☁️" },
  { name: "DevOps", count: "4+", icon: "🔧" },
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
      <section className="relative bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-300 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-200 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Construction className="w-6 h-6 text-purple-600" />
            <Badge className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">Coming Soon</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Validate Your Skills with <span className="text-purple-600">Certified Assessments</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're actively creating skill validation opportunities to help professionals like you showcase verified
            expertise to top employers.
          </p>

          {/* Coming Soon Notice */}
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Rocket className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Platform Launching Soon!</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Our comprehensive skill assessment platform is under development. Be the first to know when we launch!
            </p>
            <div className="flex items-center bg-white rounded-full shadow-lg p-2 max-w-md mx-auto">
              <div className="flex items-center flex-1 px-4">
                <Bell className="w-5 h-5 text-gray-400 mr-3" />
                <Input
                  placeholder="Enter your email for updates"
                  className="border-0 focus-visible:ring-0 text-gray-700 placeholder-gray-500"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 font-medium">
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Skills Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Skill Assessments</h2>
            <p className="text-lg text-gray-600">Get ready to validate your expertise in these technologies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSkills.map((skill, index) => (
              <Card key={index} className="border border-gray-200 rounded-xl opacity-75 cursor-not-allowed">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {skill.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{skill.name}</CardTitle>
                      <CardDescription className="text-gray-500">{skill.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>TBD</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>TBD</span>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full">
                    <Construction className="w-3 h-3 mr-1" />
                    {skill.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Categories Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planned Skill Categories</h2>
            <p className="text-lg text-gray-600">Comprehensive assessments across different technology areas</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {skillCategories.map((category, index) => (
              <Card key={index} className="text-center rounded-xl border border-gray-200 opacity-75 cursor-not-allowed">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} skills</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Will Work */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Skill Validation Will Work</h2>
            <p className="text-lg text-gray-600">Three simple steps to earn your certification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Skill</h3>
              <p className="text-gray-600">
                Browse our comprehensive library of technology assessments and select the skills you want to validate.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Take Assessment</h3>
              <p className="text-gray-600">
                Complete proctored assessments with real coding challenges and multiple-choice questions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn Certification</h3>
              <p className="text-gray-600">
                Get verified badges that appear on your WorkZen profile and showcase your expertise to employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Available Now for Your Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="bg-purple-700 rounded-xl p-6">
              <div className="text-2xl font-bold mb-2">Highly Secured Platform</div>
              <div className="text-purple-200 mb-3">Enterprise-Grade Security</div>
              <div className="text-sm">Robust security measures to protect your assessment data and ensure test integrity</div>
            </div>
            <div className="bg-purple-700 rounded-xl p-6">
              <div className="text-2xl font-bold mb-2">Comprehensive Testing</div>
              <div className="text-purple-200 mb-3">Skill Assessment</div>
              <div className="text-sm">Advanced assessment engine with a growing library of skill tests for accurate candidate evaluation</div>
            </div>
            <div className="bg-purple-700 rounded-xl p-6">
              <div className="text-2xl font-bold mb-2">Company Portal</div>
              <div className="text-purple-200 mb-3">For Organizations</div>
              <div className="text-sm">Dedicated portal for companies to manage tests, candidates, and view detailed analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Be Among the First to Validate Your Skills</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our waitlist and get early access to the most comprehensive skill validation platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4">
              <Bell className="w-5 h-5 mr-2" />
              Join Waitlist
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full px-8 py-4 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen</span>
              </div>
              <p className="text-gray-600">Validate your skills and get hired faster with verified certifications.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Coming Soon</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="text-gray-400">Programming</li>
                <li className="text-gray-400">Frontend</li>
                <li className="text-gray-400">Backend</li>
                <li className="text-gray-400">Cloud</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="text-gray-400">Contests</li>
                <li className="text-gray-400">Leaderboard</li>
                <li className="text-gray-400">Dashboard</li>
                <li className="text-gray-400">Help</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 WorkZen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
