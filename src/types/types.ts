// Типы данных для системы учёта посещаемости

export type Course = 
  | "Компьютерная грамотность" 
  | "Разработка" 
  | "Дизайн" 
  | "Робототехника"
  | "3D-моделирование";

export interface Subscription {
  startDate: string;
  endDate: string;
  totalClasses: number;
  usedClasses: number;
}

export interface Student {
  id: string;
  fullName: string;
  age: number;
  parentPhone: string;
  course: Course;
  subscription: Subscription;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  notes?: string;
  createdAt: string;
}

export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'exhausted';

// Вспомогательные функции для работы с абонементами
export function getSubscriptionStatus(subscription: Subscription): SubscriptionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(subscription.endDate);
  endDate.setHours(23, 59, 59, 999);
  
  const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const classesLeft = subscription.totalClasses - subscription.usedClasses;
  
  // Абонемент закончился по посещениям
  if (classesLeft <= 0) {
    return 'exhausted';
  }
  
  // Абонемент просрочен по дате
  if (daysUntilEnd < 0) {
    return 'expired';
  }
  
  // Абонемент заканчивается (менее 7 дней или менее 3 занятий)
  if (daysUntilEnd <= 7 || classesLeft <= 3) {
    return 'expiring';
  }
  
  return 'active';
}

export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'expiring':
      return 'bg-yellow-500';
    case 'expired':
    case 'exhausted':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getSubscriptionStatusText(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Активен';
    case 'expiring':
      return 'Заканчивается';
    case 'expired':
      return 'Просрочен';
    case 'exhausted':
      return 'Исчерпан';
    default:
      return 'Неизвестно';
  }
}

export function getSubscriptionStatusBadgeVariant(status: SubscriptionStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'expiring':
      return 'secondary';
    case 'expired':
    case 'exhausted':
      return 'destructive';
    default:
      return 'outline';
  }
}
