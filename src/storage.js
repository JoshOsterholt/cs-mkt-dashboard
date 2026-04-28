const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

export const loadData = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/dashboard?id=eq.main&select=data`,
      { headers: HEADERS }
    );
    const rows = await res.json();
    return rows?.[0]?.data || null;
  } catch {
    return null;
  }
};

export const saveData = async (data) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/dashboard?id=eq.main`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
    });
  } catch (e) {
    console.error('Save failed:', e);
  }
};

export const exportData = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cs-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { resolve(JSON.parse(ev.target.result)); }
        catch { alert('Invalid JSON file'); resolve(null); }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
