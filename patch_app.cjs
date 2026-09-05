const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('AdminJobNew')) {
  code = code.replace(
    "import CTCCalculator from './pages/CTCCalculator';",
    "import CTCCalculator from './pages/CTCCalculator';\nimport AdminJobNew from './pages/AdminJobNew';\nimport AdminBlogNew from './pages/AdminBlogNew';"
  );
  
  code = code.replace(
    '<Route path="/tools/resume-checker" element={<ResumeChecker />} />',
    '<Route path="/tools/resume-checker" element={<ResumeChecker />} />\n            <Route path="/admin/jobs/new" element={<AdminJobNew />} />\n            <Route path="/admin/blog/new" element={<AdminBlogNew />} />'
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
