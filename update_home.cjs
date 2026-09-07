const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');
c = c.replace("import React from 'react';", "import React from 'react';\nimport SEO from '../components/layout/SEO';");
c = c.replace('<div className="min-h-screen">', '<div className="min-h-screen">\n      <SEO title="Fresher First | Entry Level Jobs & Internships for Graduates" description="Find the best entry-level jobs, internships, and fresher opportunities in India. Start your career with verified employers on Fresher First." canonicalUrl="/" />');
fs.writeFileSync('src/pages/Home.tsx', c);
