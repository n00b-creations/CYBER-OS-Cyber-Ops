export type NotificationPriority = 'info' | 'warning' | 'critical';

export interface Notification {
  id: string;
  organizationId: string;
  title: string;
  detail: string;
  priority: NotificationPriority;
  createdAt: string;
  readAt?: string;
  href?: string;
}

export function unreadCount(items: Notification[]): number {
  return items.reduce((count, item) => count + (item.readAt ? 0 : 1), 0);
}
