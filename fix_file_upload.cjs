const fs = require('fs');
let p = fs.readFileSync('src/pages/candidate/Profile.tsx', 'utf8');

const uploadCode = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // SECURITY: Validate File Size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // SECURITY: Validate File Extension and MIME Type
    const validMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExts = ['pdf', 'doc', 'docx'];
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!validMimes.includes(file.type) || !fileExt || !validExts.includes(fileExt)) {
      alert("Invalid file type. Only PDF and DOC/DOCX are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSaving(true);`;

p = p.replace(/  const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?setSaving\(true\);/, uploadCode);

fs.writeFileSync('src/pages/candidate/Profile.tsx', p);
