import localforage from 'localforage';

const store = localforage.createInstance({
  name: 'cs-marketing-dashboard',
  storeName: 'dashboard_data',
});

export const loadData = async () => {
  try {
    return await store.getItem('dashboardState');
  } catch {
    return null;
  }
};

export const saveData = async (data) => {
  try {
    await store.setItem('dashboardState', data);
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
        try {
          resolve(JSON.parse(ev.target.result));
        } catch {
          alert('Invalid JSON file');
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
