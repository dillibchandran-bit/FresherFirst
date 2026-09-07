const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

c = c.replace(
  '<div className="flex items-center md:hidden">',
  '<div className="flex items-center md:hidden gap-2">\n            {user && <NotificationCenter />}'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
