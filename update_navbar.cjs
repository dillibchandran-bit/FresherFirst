const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

if (!c.includes('import NotificationCenter')) {
  c = c.replace(
    "import { Link, useNavigate, useLocation } from 'react-router-dom';",
    "import { Link, useNavigate, useLocation } from 'react-router-dom';\nimport NotificationCenter from './NotificationCenter';"
  );
  
  c = c.replace(
    /<button\s+onClick=\{handleSignOut\}[\s\S]*?<\/button>/,
    `<NotificationCenter />\n                  <button onClick={handleSignOut} className="text-gray-600 hover:text-amber-600 font-medium px-4 py-2">Sign Out</button>`
  );
  
  fs.writeFileSync('src/components/layout/Navbar.tsx', c);
}
