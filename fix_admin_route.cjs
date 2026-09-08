const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf8');

if (!c.includes('path="/admin"')) {
  c = c.replace(
    /\{\/\* Protected Admin Routes \*\/\}/,
    `{/* Protected Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />`
  );
  fs.writeFileSync('src/App.tsx', c);
  console.log("Added /admin route to App.tsx");
} else {
  console.log("Route /admin already exists");
}
