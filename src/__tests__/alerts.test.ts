import {parseCmsBootstrap} from '../cms/bootstrap';
import {
  alertStorageKey,
  appliesToPage,
  isAlertOnCooldown,
  parseDismissedAtMap,
  selectTopBarAlert,
} from '../cms/alerts';

const liveAlert = {
  id: '6a5a9603de94bce2344e60ed',
  title: 'Aviso de cierre',
  message: 'Hoy tenemos un compromiso de aviso de cierre',
  placement: 'topBar',
  dismissible: true,
  priority: 100,
  pageSlugs: [],
  frequency: {type: 'always', cooldownHours: 24},
  trigger: {type: 'load', delayMs: 3000, scrollPercent: 30},
  actions: [
    {label: 'Ir a google', href: '/legal/privacy_policy'},
    {label: 'Ir a menú', href: '/menu'},
  ],
};

describe('CMS alert targeting', () => {
  it('treats empty pageSlugs as every screen and keeps CMS page targeting', () => {
    const {alerts} = parseCmsBootstrap({alerts: [liveAlert]});
    const alert = alerts[0];

    expect(appliesToPage(alert, 'home')).toBe(true);
    expect(appliesToPage(alert, 'menu')).toBe(true);
    expect(appliesToPage(alert, 'privacy_policy')).toBe(true);

    const menuOnly = parseCmsBootstrap({
      alerts: [{...liveAlert, pageSlugs: ['menu']}],
    }).alerts[0];

    expect(appliesToPage(menuOnly, 'home')).toBe(false);
    expect(appliesToPage(menuOnly, 'menu')).toBe(true);
  });

  it('selects the highest-priority topBar alert and ignores other placements', () => {
    const {alerts} = parseCmsBootstrap({
      alerts: [
        {...liveAlert, id: 'modal', placement: 'modal', priority: 200},
        {...liveAlert, id: 'low', priority: 10, title: 'Low'},
        {...liveAlert, id: 'high', priority: 50, title: 'High'},
      ],
    });

    expect(selectTopBarAlert(alerts, 'home')?.id).toBe('high');
    expect(selectTopBarAlert(alerts, 'home')?.title).toBe('High');
  });
});

describe('CMS alert cooldown', () => {
  it('hides a dismissed alert for the CMS cooldown window', () => {
    const alert = parseCmsBootstrap({alerts: [liveAlert]}).alerts[0];
    const dismissedAt = Date.parse('2026-09-11T12:00:00.000Z');

    expect(
      isAlertOnCooldown(alert, dismissedAt, dismissedAt + 23 * 60 * 60 * 1000),
    ).toBe(true);
    expect(
      isAlertOnCooldown(alert, dismissedAt, dismissedAt + 24 * 60 * 60 * 1000),
    ).toBe(false);
    expect(isAlertOnCooldown(alert, undefined, dismissedAt)).toBe(false);
  });

  it('keeps a dismissed alert hidden when the CMS omits cooldownHours', () => {
    const alert = parseCmsBootstrap({
      alerts: [{...liveAlert, frequency: {type: 'once'}}],
    }).alerts[0];

    expect(isAlertOnCooldown(alert, 1, 100)).toBe(true);
    expect(alertStorageKey(alert)).toBe('6a5a9603de94bce2344e60ed');
  });

  it('ignores malformed dismiss persistence', () => {
    expect(parseDismissedAtMap(null)).toEqual({});
    expect(parseDismissedAtMap('not-json')).toEqual({});
    expect(parseDismissedAtMap('[]')).toEqual({});
    expect(parseDismissedAtMap('{"ok":123,"nope":"x"}')).toEqual({ok: 123});
  });
});
