import { CaliforniaLocation, HazardProfile, AuditReport } from '../types/wildfire';

const LOCAL_STORAGE_SAVED_AUDITS_KEY = 'ember_ready_audits_v1';
const LOCAL_STORAGE_LAST_AUDIT_KEY = 'ember_ready_last_audit_id';

export async function geocodeAddress(query: string): Promise<{ ok: boolean; location?: CaliforniaLocation; error?: string; warning?: string }> {
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || 'Failed to geocode address' };
    }
    return { ok: true, location: data.location, warning: data.warning };
  } catch (err: any) {
    return { ok: false, error: 'Network error connecting to geocoding service.' };
  }
}

export async function fetchHazardProfile(location: CaliforniaLocation): Promise<{ ok: boolean; profile?: HazardProfile; error?: string }> {
  try {
    const url = `/api/hazard-profile?lat=${location.lat}&lon=${location.lon}&county=${encodeURIComponent(
      location.county
    )}&address=${encodeURIComponent(location.address)}&city=${encodeURIComponent(
      location.city
    )}&zipCode=${encodeURIComponent(location.zipCode)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || 'Failed to assemble hazard profile.' };
    }
    return { ok: true, profile: data.profile };
  } catch (err: any) {
    return { ok: false, error: 'Network error connecting to wildfire hazard feeds.' };
  }
}

export async function saveAudit(report: AuditReport): Promise<{ ok: boolean; id: string; error?: string }> {
  // Always save to browser localStorage for offline durability
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_SAVED_AUDITS_KEY);
    const audits: AuditReport[] = existingStr ? JSON.parse(existingStr) : [];
    const idx = audits.findIndex((a) => a.id === report.id);
    if (idx >= 0) {
      audits[idx] = report;
    } else {
      audits.unshift(report);
    }
    localStorage.setItem(LOCAL_STORAGE_SAVED_AUDITS_KEY, JSON.stringify(audits.slice(0, 50)));
    localStorage.setItem(LOCAL_STORAGE_LAST_AUDIT_KEY, report.id);
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // Also persist to server database
  try {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      return { ok: true, id: report.id };
    }
  } catch (e) {
    // Offline save still succeeded locally
    return { ok: true, id: report.id };
  }

  return { ok: true, id: report.id };
}

export async function fetchAuditById(id: string): Promise<AuditReport | null> {
  // 1. Check server first
  try {
    const res = await fetch(`/api/audits/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.audit) {
        return data.audit;
      }
    }
  } catch (e) {
    // continue to local
  }

  // 2. Fallback to local storage
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_SAVED_AUDITS_KEY);
    if (existingStr) {
      const audits: AuditReport[] = JSON.parse(existingStr);
      const found = audits.find((a) => a.id === id);
      if (found) return found;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function listAllSavedAudits(): Promise<{ id: string; address: string; city: string; score: number; date: string }[]> {
  const summaries: { id: string; address: string; city: string; score: number; date: string }[] = [];

  // Try server
  try {
    const res = await fetch('/api/audits');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.audits)) {
        for (const a of data.audits) {
          summaries.push({
            id: a.id,
            address: a.address,
            city: a.city,
            score: a.score,
            date: a.createdAt,
          });
        }
        return summaries;
      }
    }
  } catch (e) {
    // continue to local
  }

  // Local fallback
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_SAVED_AUDITS_KEY);
    if (existingStr) {
      const audits: AuditReport[] = JSON.parse(existingStr);
      for (const a of audits) {
        summaries.push({
          id: a.id,
          address: a.hazardProfile?.location?.address || 'California Address',
          city: a.hazardProfile?.location?.city || '',
          score: a.hardeningScore?.overallScore || 0,
          date: a.createdAt,
        });
      }
    }
  } catch (e) {
    // ignore
  }

  return summaries;
}
