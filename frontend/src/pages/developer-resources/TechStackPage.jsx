import React from 'react';
import DeveloperLayout from '../../components/developer/DeveloperLayout';

export default function TechStackPage() {
  const technologies = [
    {
      category: 'Frontend',
      items: [
        { name: 'React', version: '18.2.0', purpose: 'UI Framework' },
        { name: 'Vite', version: '4.3.9', purpose: 'Build Tool & Dev Server' },
        { name: 'Tailwind CSS', version: '3.3.2', purpose: 'Utility-first CSS Framework' },
        { name: 'React Router DOM', version: '6.13.0', purpose: 'Client-side Routing' },
        { name: 'Axios', version: '1.4.0', purpose: 'HTTP Client' },
        { name: 'Socket.io Client', version: 'Latest', purpose: 'Real-time Communication' },
      ],
    },
    {
      category: 'Backend',
      items: [
        { name: 'Node.js', version: '16+', purpose: 'JavaScript Runtime' },
        { name: 'Express.js', version: '4.18.2', purpose: 'Web Framework' },
        { name: 'Sequelize', version: '6.32.0', purpose: 'ORM (Object-Relational Mapping)' },
        { name: 'MySQL2', version: '3.6.0', purpose: 'Database Driver' },
        { name: 'Socket.io', version: '4.6.1', purpose: 'Real-time Events' },
        { name: 'JWT', version: '9.0.0', purpose: 'Authentication Tokens' },
        { name: 'Bcryptjs', version: '2.4.3', purpose: 'Password Hashing' },
        { name: 'Helmet.js', version: '7.0.0', purpose: 'Security Headers' },
        { name: 'CORS', version: '2.8.5', purpose: 'Cross-Origin Resource Sharing' },
      ],
    },
    {
      category: 'Database',
      items: [
        { name: 'MariaDB', version: '10.5+', purpose: 'Relational Database' },
        { name: 'MySQL', version: '8.0+', purpose: 'Alternative DB Option' },
      ],
    },
    {
      category: 'Development Tools',
      items: [
        { name: 'Git', version: 'Latest', purpose: 'Version Control' },
        { name: 'GitHub', version: '-', purpose: 'Repository Hosting' },
        { name: 'Nodemon', version: '2.0.22', purpose: 'Auto-restart Dev Server' },
        { name: 'npm', version: 'Latest', purpose: 'Package Manager' },
        { name: 'VS Code', version: 'Latest', purpose: 'Code Editor' },
      ],
    },
  ];

  return (
    <DeveloperLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-squash-dark mb-4">🛠️ Technology Stack</h1>
        <p className="text-gray-600 mb-6">Complete list of all technologies and frameworks used in Squash Arena</p>
        
        <button className="btn-primary mb-8">
          📥 Download Tech Stack Report
        </button>
      </div>

      <div className="space-y-8">
        {technologies.map((section, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-squash-primary to-squash-dark text-white p-6">
              <h2 className="text-2xl font-bold">{section.category}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-squash-light">
                      <th className="text-left py-3 px-4 font-bold text-squash-dark">Technology</th>
                      <th className="text-left py-3 px-4 font-bold text-squash-dark">Version</th>
                      <th className="text-left py-3 px-4 font-bold text-squash-dark">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="border-b border-squash-light hover:bg-squash-light">
                        <td className="py-3 px-4 font-semibold text-squash-dark">{item.name}</td>
                        <td className="py-3 px-4 text-gray-600">{item.version}</td>
                        <td className="py-3 px-4 text-gray-600">{item.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Architecture Decisions</h3>
        <div className="space-y-4 text-blue-800">
          <div>
            <h4 className="font-semibold mb-1">Why React?</h4>
            <p className="text-sm">Component-based architecture, large ecosystem, and excellent tooling make React ideal for modern web applications.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Why Express.js?</h4>
            <p className="text-sm">Lightweight, flexible, and widely adopted. Perfect for building RESTful APIs with Node.js.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Why Sequelize?</h4>
            <p className="text-sm">Mature ORM with strong support for MariaDB/MySQL, automatic migrations, and intuitive query building.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Why Tailwind CSS?</h4>
            <p className="text-sm">Utility-first approach speeds up development, ensures consistency, and provides excellent customization.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-green-50 border border-green-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-green-900 mb-4">System Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-900 mb-3">Development</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Node.js 16.0.0 or higher</li>
              <li>✓ npm or yarn package manager</li>
              <li>✓ MariaDB 10.5+ or MySQL 8.0+</li>
              <li>✓ 4GB RAM minimum</li>
              <li>✓ 2GB storage minimum</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-900 mb-3">Production</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Server with 8GB+ RAM</li>
              <li>✓ 50GB+ storage (scalable)</li>
              <li>✓ Load balancer support</li>
              <li>✓ Database clustering</li>
              <li>✓ CDN for static assets</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-purple-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-900 mb-3">Frontend Performance</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>Bundle Size: ~450KB (minified)</li>
              <li>Page Load: 2-3 seconds</li>
              <li>Time to Interactive: ~1 second</li>
              <li>Lighthouse Score: 85+</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 mb-3">Backend Performance</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>Response Time: 50-200ms</li>
              <li>Throughput: 100+ requests/sec</li>
              <li>DB Query Time: 5-50ms</li>
              <li>Uptime: 99.5% SLA</li>
            </ul>
          </div>
        </div>
      </section>
    </DeveloperLayout>
  );
}
