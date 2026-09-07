const fs = require('fs');
let c = fs.readFileSync('src/pages/jobs/JobList.tsx', 'utf8');

c = c.replace("import { useSearchParams } from 'react-router-dom';", "import { useSearchParams, useLocation, useParams } from 'react-router-dom';\nimport SEO from '../../components/layout/SEO';");

const dynamicSEO = `
  const locationPath = useLocation();
  const { location: locationParam } = useParams();
  
  let pageTitle = "Entry Level Jobs & Internships | Fresher First";
  let pageDescription = "Search thousands of verified entry-level jobs and internships for freshers.";
  let canonicalUrl = "/jobs";
  let displayTitle = "Find Your First Tech Job";

  if (locationPath.pathname.includes('/jobs/freshers')) {
    pageTitle = "Fresher Jobs & Walk-ins | Fresher First";
    pageDescription = "Apply to the latest fresher jobs and walk-ins. Verified employers hiring entry-level candidates.";
    canonicalUrl = "/jobs/freshers";
    displayTitle = "Fresher Jobs & Walk-ins";
  } else if (locationPath.pathname.includes('/locations/')) {
    const locName = locationParam ? locationParam.charAt(0).toUpperCase() + locationParam.slice(1).replace('-', ' ') : 'India';
    pageTitle = \`Jobs in \${locName} | Fresher First\`;
    pageDescription = \`Search jobs and internships in \${locName}. Discover opportunities from verified employers.\`;
    canonicalUrl = \`/locations/\${locationParam}\`;
    displayTitle = \`Jobs in \${locName}\`;
  }
`;

c = c.replace("const [searchParams, setSearchParams] = useSearchParams();", "const [searchParams, setSearchParams] = useSearchParams();" + dynamicSEO);

c = c.replace('<div className="bg-gray-50 min-h-screen pb-20">', '<div className="bg-gray-50 min-h-screen pb-20">\n      <SEO title={pageTitle} description={pageDescription} canonicalUrl={canonicalUrl} />');
c = c.replace('<h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Find Your First Tech Job</h1>', '<h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">{displayTitle}</h1>');

// Map locations params to initial states
// If url is /locations/omr, the user might want it to filter automatically by OMR
// But wait, the component reads \`const locId = searchParams.get('location') || '';\`
// Let's add an effect to sync params if the URL dictates it
const syncEffect = `
  useEffect(() => {
    if (locationParam && locations.length > 0) {
      const matchedLoc = locations.find(l => l.slug === locationParam);
      if (matchedLoc && locId !== matchedLoc.id) {
         const newParams = new URLSearchParams(searchParams);
         newParams.set('location', matchedLoc.id);
         setSearchParams(newParams);
      }
    }
  }, [locationParam, locations]);

  useEffect(() => {
    if (locationPath.pathname === '/jobs/freshers' && !fresherOnly) {
       const newParams = new URLSearchParams(searchParams);
       newParams.set('fresher', 'true');
       setSearchParams(newParams);
    }
  }, [locationPath.pathname]);
`;

c = c.replace('useEffect(() => {', syncEffect + '\n  useEffect(() => {');

fs.writeFileSync('src/pages/jobs/JobList.tsx', c);
