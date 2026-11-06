import { redirect } from 'next/navigation';

export default function CustomerNotificationsPage() {
  redirect('/customer?tab=notifications');
}
