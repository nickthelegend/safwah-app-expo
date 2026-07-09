import {
  getActivities,
  addActivity,
  clearActivities,
  formatTime,
  type Activity,
} from '../activity';

// AsyncStorage is swapped for its in-memory mock in jest.setup.js.
beforeEach(async () => {
  await clearActivities();
});

describe('activity storage', () => {
  it('starts empty', async () => {
    expect(await getActivities()).toEqual([]);
  });

  it('adds an activity with generated id/timestamp/time and persists it', async () => {
    const updated = await addActivity({ title: 'Swapped USDT → AED', type: 'swap' });
    expect(updated).toHaveLength(1);

    const [a] = updated;
    expect(a.title).toBe('Swapped USDT → AED');
    expect(a.type).toBe('swap');
    expect(typeof a.id).toBe('string');
    expect(a.id.length).toBeGreaterThan(0);
    expect(typeof a.timestamp).toBe('number');
    expect(a.time).toBe('Just now');

    // survives a reload
    const reloaded = await getActivities();
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].title).toBe('Swapped USDT → AED');
  });

  it('prepends newest first', async () => {
    await addActivity({ title: 'first', type: 'send' });
    await addActivity({ title: 'second', type: 'bridge' });
    const list = await getActivities();
    expect(list.map((x: Activity) => x.title)).toEqual(['second', 'first']);
  });

  it('keeps only the most recent 20', async () => {
    for (let i = 0; i < 25; i++) {
      await addActivity({ title: `tx-${i}`, type: 'task' });
    }
    const list = await getActivities();
    expect(list).toHaveLength(20);
    expect(list[0].title).toBe('tx-24'); // newest
    expect(list[19].title).toBe('tx-5'); // 20 kept, oldest 5 dropped
  });

  it('clears everything', async () => {
    await addActivity({ title: 'gone soon', type: 'stats' });
    await clearActivities();
    expect(await getActivities()).toEqual([]);
  });
});

describe('formatTime', () => {
  const now = Date.now();

  it('shows "Just now" under a minute', () => {
    expect(formatTime(now)).toBe('Just now');
    expect(formatTime(now - 30 * 1000)).toBe('Just now');
  });

  it('shows minutes under an hour', () => {
    expect(formatTime(now - 5 * 60_000)).toBe('5m ago');
    expect(formatTime(now - 59 * 60_000)).toBe('59m ago');
  });

  it('shows hours under a day', () => {
    expect(formatTime(now - 3 * 3_600_000)).toBe('3h ago');
    expect(formatTime(now - 23 * 3_600_000)).toBe('23h ago');
  });

  it('shows days beyond that', () => {
    expect(formatTime(now - 2 * 86_400_000)).toBe('2d ago');
    expect(formatTime(now - 10 * 86_400_000)).toBe('10d ago');
  });
});
