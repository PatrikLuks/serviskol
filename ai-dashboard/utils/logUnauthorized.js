// Logování pokusu o neoprávněný přístup (frontend)
export async function logUnauthorizedAccess({ user, action, section }) {
  try {
    await fetch('/api/admin/log-unauthorized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, action, section, timestamp: new Date().toISOString() })
    });
  } catch (e) {
    // ignore
  }
}
