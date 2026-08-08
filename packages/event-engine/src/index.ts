import type { SecurityEvent } from '../../shared/src/domain';

export interface TimelineFilter {
  severities?: SecurityEvent['severity'][];
  sources?: string[];
  assetIds?: string[];
  from?: string;
  to?: string;
}

export class EventTimeline {
  constructor(private readonly events: SecurityEvent[]) {}

  query(filter: TimelineFilter = {}): SecurityEvent[] {
    const from = filter.from ? Date.parse(filter.from) : Number.NEGATIVE_INFINITY;
    const to = filter.to ? Date.parse(filter.to) : Number.POSITIVE_INFINITY;

    return this.events
      .filter((event) => {
        const timestamp = Date.parse(event.timestamp);
        if (timestamp < from || timestamp > to) return false;
        if (filter.severities?.length && !filter.severities.includes(event.severity)) return false;
        if (filter.sources?.length && !filter.sources.includes(event.source)) return false;
        if (filter.assetIds?.length && (!event.assetId || !filter.assetIds.includes(event.assetId))) return false;
        return true;
      })
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  }

  correlate(assetId: string): SecurityEvent[] {
    return this.query({ assetIds: [assetId] });
  }
}
