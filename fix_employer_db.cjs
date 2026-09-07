const fs = require('fs');

let c = fs.readFileSync('src/pages/employer/Dashboard.tsx', 'utf8');
c = c.replace(/\.select\(\)\.maybeSingle\(\)\.select\(\)/g, '');
c = c.replace(/\.select\(\)\.maybeSingle\(\)/g, '');

// manually fix the insert
c = c.replace(/        \.insert\(\{\n          name: setupCompanyName,\n          slug: slug,\n        \} as any\)/, `        .insert({
          name: setupCompanyName,
          slug: slug,
        } as any).select().single()`);

fs.writeFileSync('src/pages/employer/Dashboard.tsx', c);
