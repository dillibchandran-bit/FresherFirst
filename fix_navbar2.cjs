const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

c = c.replace(
  '{user ? (\n                  <NotificationCenter />\n                  <Link to={getDashboardLink()}',
  '{user ? (\n                  <>\n                  <NotificationCenter />\n                  <Link to={getDashboardLink()}'
);
c = c.replace(
  'Dashboard\n                </Link>\n              ) : (',
  'Dashboard\n                </Link>\n                  </>\n              ) : ('
);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
