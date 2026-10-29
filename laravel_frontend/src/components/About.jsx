import React from 'react'
import { Target, Users, Zap, Shield } from 'lucide-react'

function About() {
  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'Streamline pharmacy operations and improve customer experience through modern self-service technology.'
    },
    {
      icon: Users,
      title: 'User-Focused',
      description: 'Designed with both customers and pharmacy staff in mind for intuitive operation.'
    },
    {
      icon: Zap,
      title: 'Efficiency',
      description: 'Reduce wait times and improve transaction accuracy with automated processes.'
    },
    {
      icon: Shield,
      title: 'Reliable',
      description: 'Built with robust technology stack ensuring system stability and data integrity.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              About MediKiosk
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                MediKiosk is a web-based pharmacy self-service ordering project designed to improve 
                medicine browsing, order preparation, inventory visibility, and transaction organization.
              </p>
              <p>
                Built as an academic system project, MediKiosk demonstrates modern web development 
                practices using Laravel PHP framework for the backend API and React.js for an 
                interactive frontend interface.
              </p>
              <p>
                The system allows customers to independently browse available medicines, check 
                stock levels, and prepare their orders through an intuitive kiosk interface. 
                Meanwhile, pharmacy staff can manage inventory, process orders, and monitor 
                transactions through a dedicated dashboard.
              </p>
              <p>
                This project showcases full-stack development capabilities including RESTful API 
                design, database management, responsive UI design, and modern JavaScript frameworks.
              </p>
            </div>
          </div>

          {/* Right Content - Values Grid */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="card">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Tech Stack Badge */}
            <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-3">Technology Stack</h4>
              <div className="flex flex-wrap gap-2">
                {['Laravel', 'React.js', 'Vite', 'Tailwind CSS', 'MySQL', 'REST API'].map((tech, idx) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
