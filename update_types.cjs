const fs = require('fs');
let c = fs.readFileSync('src/types/index.ts', 'utf8');

const notifType = `
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  reference_id?: string;
  reference_type?: string;
  channels?: string[];
  created_at: string;
}
`;

if (!c.includes('export interface Notification')) {
  fs.writeFileSync('src/types/index.ts', c + '\n' + notifType);
}
