type EventoWebTipo = 'pageview' | 'whatsapp_click';

function readUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

export function trackVisit(ruta: string, tipo: EventoWebTipo = 'pageview'): void {
  const params = new URLSearchParams({ ruta, tipo });
  const utm = readUtmParams();
  for (const [key, value] of Object.entries(utm)) {
    params.set(key, value);
  }
  const referrer = document.referrer;
  if (referrer) params.set('referrer', referrer.slice(0, 200));

  fetch(`/api/track-visit?${params.toString()}`, {
    method: 'GET',
    keepalive: true,
  }).catch(() => {});
}
