const DRAFT_KEY = 'damage-report-draft';

export function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
