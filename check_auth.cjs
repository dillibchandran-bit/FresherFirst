const fs = require('fs');
let c = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const replacement = `
      if (data && data.status === 'suspended') {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        alert('Your account has been suspended by an administrator.');
        return;
      }
      setProfile(data as Profile);
`;

c = c.replace('setProfile(data as Profile);', replacement);
fs.writeFileSync('src/contexts/AuthContext.tsx', c);
