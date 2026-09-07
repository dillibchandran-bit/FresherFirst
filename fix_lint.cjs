const fs = require('fs');
let c = fs.readFileSync('src/pages/candidate/Dashboard.tsx', 'utf8');

c = c.replace(
  'const { profile, signOut, user } = useAuth();',
  'const { profile, signOut, user } = useAuth();'
); // placeholder just in case

fs.writeFileSync('src/pages/candidate/Dashboard.tsx', c);
