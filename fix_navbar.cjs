const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

c = c.replace(
  "import { Link, useNavigate } from 'react-router-dom';",
  "import { Link, useNavigate } from 'react-router-dom';\nimport NotificationCenter from './NotificationCenter';"
);

c = c.replace(
  '<Link to={getDashboardLink()}',
  '<NotificationCenter />\n                  <Link to={getDashboardLink()}'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
