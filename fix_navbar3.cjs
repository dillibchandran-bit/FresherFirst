const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

c = c.replace(
  '{user ? (\n                <NotificationCenter />\n                  <Link to={getDashboardLink()} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-200">\n                  <User className="w-4 h-4" />\n                  Dashboard\n                </Link>\n                  </>\n              ) : (',
  '{user ? (\n                <>\n                  <NotificationCenter />\n                  <Link to={getDashboardLink()} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-200">\n                    <User className="w-4 h-4" />\n                    Dashboard\n                  </Link>\n                </>\n              ) : ('
);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
