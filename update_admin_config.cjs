const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

const actionsToAdd = `
  const handleAddCategory = async () => {
    const name = prompt('Enter new category name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('job_categories').insert({ name, slug });
    logAdminAction('created_category', 'category', slug);
    fetchConfig();
  };

  const handleAddLocation = async () => {
    const name = prompt('Enter new location name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('locations').insert({ name, slug });
    logAdminAction('created_location', 'location', slug);
    fetchConfig();
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(\`Are you sure you want to delete category "\${name}"?\`)) return;
    await supabase.from('job_categories').delete().eq('id', id);
    logAdminAction('deleted_category', 'category', id);
    fetchConfig();
  };

  const handleDeleteLocation = async (id, name) => {
    if (!confirm(\`Are you sure you want to delete location "\${name}"?\`)) return;
    await supabase.from('locations').delete().eq('id', id);
    logAdminAction('deleted_location', 'location', id);
    fetchConfig();
  };
`;

content = content.replace('if (loading) return', actionsToAdd + '\n  if (loading) return');

// Update UI
const categoriesUI = `
                  <ul className="divide-y divide-gray-100 mb-4 border rounded">
                    {categories.map(c => (
                      <li key={c.id} className="px-3 py-2 flex justify-between items-center text-sm">
                        <span>{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{c.slug}</span>
                          <button onClick={() => handleDeleteCategory(c.id, c.name)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleAddCategory} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium">Add Category</button>
`;

const locationsUI = `
                  <ul className="divide-y divide-gray-100 mb-4 border rounded">
                    {locations.map(l => (
                      <li key={l.id} className="px-3 py-2 flex justify-between items-center text-sm">
                        <span>{l.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{l.slug}</span>
                          <button onClick={() => handleDeleteLocation(l.id, l.name)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleAddLocation} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium">Add Location</button>
`;

content = content.replace(/<ul className="divide-y divide-gray-100 mb-4 border rounded">[\s\S]*?Add Category<\/button>/, categoriesUI);
content = content.replace(/<ul className="divide-y divide-gray-100 mb-4 border rounded">[\s\S]*?Add Location<\/button>/, locationsUI);

fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
