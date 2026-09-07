const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\.insert\(([\s\S]*?)\)$/gm, '.insert($1).select()');
  // the previous regex didn't catch multiline properly, let's just do it specifically
  c = c.replace(/\} as any\)/g, '} as any).select().maybeSingle()');
  fs.writeFileSync(file, c);
}

fix('src/pages/employer/Dashboard.tsx');
