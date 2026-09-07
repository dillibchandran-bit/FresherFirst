const fs = require('fs');
let c = fs.readFileSync('src/pages/jobs/JobList.tsx', 'utf8');

const locationCopy = `
  const getLocationContent = () => {
    if (!locationParam) return null;
    const loc = locationParam.toLowerCase();
    const chennaiHubs = ['omr', 'sholinganallur', 'navalur', 'siruseri', 'kelambakkam', 'chennai'];
    
    if (chennaiHubs.includes(loc)) {
      return (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8 text-amber-900">
          <h2 className="text-lg font-bold mb-2">Tech Opportunities in {loc.charAt(0).toUpperCase() + loc.slice(1)}</h2>
          <p className="text-sm leading-relaxed">
            As a key part of Chennai's IT corridor, {loc.charAt(0).toUpperCase() + loc.slice(1)} hosts a dense cluster of tech parks and corporate campuses. 
            We partner directly with companies in this zone to bring you verified entry-level roles and internships. 
            Whether you're looking for software development, testing, or analytics roles, this hub offers excellent infrastructure and career growth for fresh graduates.
          </p>
        </div>
      );
    }
    return null;
  };
`;

c = c.replace('const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);', locationCopy + '\n  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);');

c = c.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">',
  '{getLocationContent()}\n        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">'
);

fs.writeFileSync('src/pages/jobs/JobList.tsx', c);
