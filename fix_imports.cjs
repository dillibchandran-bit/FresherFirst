const fs = require('fs');
let c = fs.readFileSync('src/pages/employer/PostJob.tsx', 'utf8');

c = c.replace(
  "import { Sparkles, Loader2, AlertCircle } from 'lucide-react';",
  "import { ArrowLeft, Save, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';"
);

fs.writeFileSync('src/pages/employer/PostJob.tsx', c);
