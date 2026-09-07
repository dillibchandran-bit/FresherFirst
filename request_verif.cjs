const fs = require('fs');
let c = fs.readFileSync('src/pages/employer/Dashboard.tsx', 'utf8');

if (!c.includes('handleRequestVerification')) {
  const insertIndex = c.indexOf('const handleLogout');
  const method = `
  const handleRequestVerification = async () => {
    if (confirm('Request verification for your company? Our team will review your profile.')) {
      await supabase.from('companies').update({ verification_status: 'pending' }).eq('id', company.id);
      window.location.reload();
    }
  };
  `;
  c = c.slice(0, insertIndex) + method + c.slice(insertIndex);
  
  c = c.replace(
    /\{\(\!company\.verification_status \|\| company\.verification_status === 'unverified'\) && <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">Unverified<\/span>\}/,
    "{(!company.verification_status || company.verification_status === 'unverified') && <button onClick={handleRequestVerification} className=\"inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors\">Unverified - Request Verification</button>}"
  );
  fs.writeFileSync('src/pages/employer/Dashboard.tsx', c);
}
