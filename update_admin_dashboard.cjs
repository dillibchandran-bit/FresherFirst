const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

c = c.replace(
  "const { count: vEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verified', true);",
  "const { count: vEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified');"
);
c = c.replace(
  "const { count: pEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verified', false);",
  "const { count: pEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending');"
);

const verifyActionFunc = `
  const handleUpdateCompanyStatus = async (id: string, status: string) => {
    await supabase.from('companies').update({ verification_status: status }).eq('id', id);
    logAdminAction(\`company_status_\${status}\`, 'company', id);
    fetchCompanies();
    fetchMetrics();
  };
`;
c = c.replace(/const handleVerifyCompany = async \([\s\S]*?fetchMetrics\(\);\n  \};/, verifyActionFunc);


const employersTableBody = `
                  <tbody>
                    {companies.filter(c => c.name.toLowerCase().includes(empSearch.toLowerCase())).map(company => (
                      <tr key={company.id} className="border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4">
                          <span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium \${
                            company.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                            company.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            company.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            company.verification_status === 'suspended' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-600'
                          }\`}>
                            {(company.verification_status || 'unverified').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(company.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={company.verification_status || 'unverified'} 
                            onChange={(e) => handleUpdateCompanyStatus(company.id, e.target.value)}
                            className="text-xs border rounded p-1"
                          >
                            <option value="unverified">Unverified</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
`;

c = c.replace(/<tbody>[\s\S]*?\{companies\.filter[\s\S]*?<\/tbody>/, employersTableBody);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', c);
