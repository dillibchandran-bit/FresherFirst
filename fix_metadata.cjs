const fs = require('fs');
if (fs.existsSync('metadata.json')) {
  let m = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
  if (!m.majorCapabilities) m.majorCapabilities = [];
  if (!m.majorCapabilities.includes("MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API")) {
    m.majorCapabilities.push("MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API");
  }
  fs.writeFileSync('metadata.json', JSON.stringify(m, null, 2));
}
