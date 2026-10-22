import { applicationQuerySchema } from './registrations.schemas';

describe('applicationQuerySchema', () => {
  it.each([10, 15, 25, 50])('accepts page size %i', (pageSize) => {
    expect(applicationQuerySchema.parse({ pageSize }).pageSize).toBe(pageSize);
  });

  it('accepts a valid custom date range', () => {
    expect(
      applicationQuerySchema.parse({
        fromDate: '2026-10-01',
        toDate: '2026-10-21',
      }),
    ).toEqual(expect.objectContaining({ fromDate: '2026-10-01', toDate: '2026-10-21' }));
  });

  it('rejects invalid dates and reversed ranges', () => {
    expect(applicationQuerySchema.safeParse({ fromDate: '2026-02-30' }).success).toBe(false);
    expect(
      applicationQuerySchema.safeParse({
        fromDate: '2026-10-22',
        toDate: '2026-10-21',
      }).success,
    ).toBe(false);
  });
});
