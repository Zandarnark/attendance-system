'use client';

import { useState, useMemo } from 'react';
import { useStudents, useAttendance } from '@/hooks/use-students';
import { 
  Student, 
  Course, 
  getSubscriptionStatus, 
  getSubscriptionStatusText,
  getSubscriptionStatusBadgeVariant,
  SubscriptionStatus
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Plus, 
  Pencil, 
  Trash2, 
  UserCheck,
  UserX,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Форматирование даты
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Получить сегодняшнюю дату в формате YYYY-MM-DD
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Список курсов
const COURSES: Course[] = [
  "Компьютерная грамотность",
  "Разработка",
  "Дизайн",
  "Робототехника",
  "3D-моделирование"
];

// Компонент формы ученика
function StudentForm({ 
  student, 
  onSubmit, 
  onCancel 
}: { 
  student?: Student; 
  onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}) {
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [age, setAge] = useState(student?.age?.toString() || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [course, setCourse] = useState<Course>(student?.course || 'Компьютерная грамотность');
  const [notes, setNotes] = useState(student?.notes || '');
  const [startDate, setStartDate] = useState(student?.subscription?.startDate || getTodayString());
  const [endDate, setEndDate] = useState(student?.subscription?.endDate || '');
  const [totalClasses, setTotalClasses] = useState(student?.subscription?.totalClasses?.toString() || '8');
  const [usedClasses, setUsedClasses] = useState(student?.subscription?.usedClasses?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      age: parseInt(age) || 0,
      parentPhone,
      course,
      notes,
      subscription: {
        startDate,
        endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalClasses: parseInt(totalClasses) || 8,
        usedClasses: parseInt(usedClasses) || 0,
      }
    });
  };

  // Установка даты окончания по умолчанию (+30 дней)
  const setDefaultEndDate = () => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    setEndDate(date.toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="fullName">ФИО ученика</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванов Иван Иванович"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Возраст</Label>
          <Input
            id="age"
            type="number"
            min="5"
            max="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="12"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="course">Курс</Label>
          <Select value={course} onValueChange={(v) => setCourse(v as Course)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COURSES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 col-span-2">
          <Label htmlFor="phone">Телефон родителя</Label>
          <Input
            id="phone"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
            required
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Абонемент
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Дата начала</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Дата окончания</Label>
            <div className="flex gap-2">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={setDefaultEndDate}>
                +30 дн.
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalClasses">Всего занятий</Label>
            <Input
              id="totalClasses"
              type="number"
              min="1"
              max="100"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="usedClasses">Использовано</Label>
            <Input
              id="usedClasses"
              type="number"
              min="0"
              value={usedClasses}
              onChange={(e) => setUsedClasses(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Заметки</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Дополнительная информация..."
        />
      </div>

      <DialogFooter>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit">
          {student ? 'Сохранить' : 'Добавить'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Компонент карточки ученика
function StudentCard({ 
  student, 
  onEdit, 
  onDelete,
  onMarkPresent 
}: { 
  student: Student; 
  onEdit: () => void;
  onDelete: () => void;
  onMarkPresent?: () => void;
}) {
  const status = getSubscriptionStatus(student.subscription);
  const classesLeft = student.subscription.totalClasses - student.subscription.usedClasses;
  const progress = (student.subscription.usedClasses / student.subscription.totalClasses) * 100;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{student.fullName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              {student.course}
            </CardDescription>
          </div>
          <Badge variant={getSubscriptionStatusBadgeVariant(status)}>
            {getSubscriptionStatusText(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            {student.age} лет
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {student.parentPhone}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Занятий: {classesLeft} из {student.subscription.totalClasses}</span>
            <span className="text-muted-foreground">
              до {formatDate(student.subscription.endDate)}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2 pt-2">
          {onMarkPresent && status === 'active' && (
            <Button size="sm" variant="default" onClick={onMarkPresent} className="flex-1">
              <UserCheck className="h-4 w-4 mr-1" />
              Присутствует
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить ученика?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить {student.fullName}? 
                  Все данные о посещаемости будут потеряны.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент Dashboard
function Dashboard({ students, records }: { students: Student[], records: ReturnType<typeof useAttendance>['records'] }) {
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => getSubscriptionStatus(s.subscription) === 'active').length;
    const expiring = students.filter(s => getSubscriptionStatus(s.subscription) === 'expiring').length;
    const expired = students.filter(s => ['expired', 'exhausted'].includes(getSubscriptionStatus(s.subscription))).length;
    
    const todayRecords = records.filter(r => r.date === getTodayString());
    const presentToday = todayRecords.filter(r => r.present).length;
    
    return { total, active, expiring, expired, presentToday };
  }, [students, records]);

  const expiringStudents = useMemo(() => 
    students
      .filter(s => getSubscriptionStatus(s.subscription) === 'expiring')
      .sort((a, b) => new Date(a.subscription.endDate).getTime() - new Date(b.subscription.endDate).getTime())
      .slice(0, 5)
  , [students]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Панель управления</h2>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Всего учеников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs opacity-75 mt-1">активных записей</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Активные абонементы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.active}</div>
            <p className="text-xs opacity-75 mt-1">действующих</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Заканчиваются</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.expiring}</div>
            <p className="text-xs opacity-75 mt-1">требуют внимания</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Сегодня на занятиях</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.presentToday}</div>
            <p className="text-xs opacity-75 mt-1">учеников</p>
          </CardContent>
        </Card>
      </div>

      {/* Заканчивающиеся абонементы */}
      {expiringStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Заканчивающиеся абонементы
            </CardTitle>
            <CardDescription>
              Ученики, которым нужно продлить абонемент
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">
                      до {formatDate(student.subscription.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.subscription.totalClasses - student.subscription.usedClasses} занятий осталось
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="font-medium">Управление учениками</p>
              <p className="text-sm text-muted-foreground">Добавление и редактирование</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="font-medium">Отметить посещение</p>
              <p className="text-sm text-muted-foreground">За сегодня</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="font-medium">Абонементы</p>
              <p className="text-sm text-muted-foreground">Просмотр и управление</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Компонент списка учеников
function StudentsList({ 
  students, 
  onAdd, 
  onEdit, 
  onDelete,
  filter
}: { 
  students: Student[];
  onAdd: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEdit: (id: string, data: Partial<Student>) => void;
  onDelete: (id: string) => void;
  filter?: SubscriptionStatus | 'all';
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<Course | 'all'>('all');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Фильтр по статусу
      if (filter && filter !== 'all') {
        const status = getSubscriptionStatus(s.subscription);
        if (status !== filter) return false;
      }
      
      // Фильтр по курсу
      if (courseFilter !== 'all' && s.course !== courseFilter) return false;
      
      // Поиск по имени
      if (searchQuery && !s.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [students, filter, courseFilter, searchQuery]);

  const handleAdd = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAdd(data);
    setIsAddOpen(false);
  };

  const handleEdit = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStudent) {
      onEdit(editingStudent.id, data);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Ученики</h2>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить ученика
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Новый ученик</DialogTitle>
              <DialogDescription>
                Заполните информацию о новом ученике
              </DialogDescription>
            </DialogHeader>
            <StudentForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Поиск по имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:w-64"
        />
        <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v as Course | 'all')}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Все курсы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все курсы</SelectItem>
            {COURSES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет учеников по заданным критериям</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={() => setEditingStudent(student)}
              onDelete={() => onDelete(student.id)}
            />
          ))}
        </div>
      )}

      {/* Диалог редактирования */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать ученика</DialogTitle>
            <DialogDescription>
              Измените информацию об ученике
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <StudentForm 
              student={editingStudent} 
              onSubmit={handleEdit} 
              onCancel={() => setEditingStudent(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент посещаемости
function AttendanceView({ 
  students, 
  records,
  onMarkAttendance,
  onGetStats
}: { 
  students: Student[];
  records: ReturnType<typeof useAttendance>['records'];
  onMarkAttendance: (studentId: string, date: string, present: boolean) => void;
  onGetStats: (studentId: string) => { total: number; present: number; absent: number; percentage: number };
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const todayRecords = useMemo(() => {
    return records.filter(r => r.date === selectedDate);
  }, [records, selectedDate]);

  const getAttendanceForStudent = (studentId: string) => {
    const record = todayRecords.find(r => r.studentId === studentId);
    return record?.present ?? null;
  };

  const activeStudents = students.filter(s => 
    ['active', 'expiring'].includes(getSubscriptionStatus(s.subscription))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Посещаемость</h2>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="date">Дата:</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Статистика за день */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {todayRecords.filter(r => r.present).length}
            </div>
            <p className="text-sm text-muted-foreground">Присутствует</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {todayRecords.filter(r => !r.present).length}
            </div>
            <p className="text-sm text-muted-foreground">Отсутствует</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {activeStudents.length - todayRecords.length}
            </div>
            <p className="text-sm text-muted-foreground">Не отмечено</p>
          </CardContent>
        </Card>
      </div>

      {/* Список для отметки */}
      <Card>
        <CardHeader>
          <CardTitle>Отметить посещение</CardTitle>
          <CardDescription>
            {selectedDate === getTodayString() ? 'Сегодня' : formatDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeStudents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет активных учеников для отметки
            </p>
          ) : (
            <div className="space-y-2">
              {activeStudents.map(student => {
                const attendance = getAttendanceForStudent(student.id);
                return (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        attendance === true ? 'bg-green-500' : 
                        attendance === false ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">{student.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={attendance === true ? "default" : "outline"}
                        className={attendance === true ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => onMarkAttendance(student.id, selectedDate, true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={attendance === false ? "destructive" : "outline"}
                        onClick={() => onMarkAttendance(student.id, selectedDate, false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог статистики ученика */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStudent?.fullName}</DialogTitle>
            <DialogDescription>Статистика посещаемости</DialogDescription>
          </DialogHeader>
          {selectedStudent && (() => {
            const stats = onGetStats(selectedStudent.id);
            const studentRecords = records
              .filter(r => r.studentId === selectedStudent.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10);
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Всего</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    <p className="text-xs text-muted-foreground">Присут.</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    <p className="text-xs text-muted-foreground">Отсутств.</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                    <p className="text-xs text-muted-foreground">Посещ.</p>
                  </div>
                </div>

                <Progress value={stats.percentage} className="h-2" />

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {studentRecords.map(record => (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted"
                    >
                      <span>{formatDate(record.date)}</span>
                      {record.present ? (
                        <Badge variant="default" className="bg-green-600">Присутствует</Badge>
                      ) : (
                        <Badge variant="destructive">Отсутствует</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент абонементов
function SubscriptionsView({ 
  students, 
  onUpdateSubscription 
}: { 
  students: Student[];
  onUpdateSubscription: (studentId: string, subscription: Partial<Student['subscription']>) => void;
}) {
  const [filter, setFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        if (filter === 'all') return true;
        return getSubscriptionStatus(s.subscription) === filter;
      })
      .sort((a, b) => {
        // Сортировка: сначала заканчивающиеся, потом активные
        const statusOrder: Record<SubscriptionStatus, number> = {
          'expiring': 0,
          'exhausted': 1,
          'expired': 2,
          'active': 3
        };
        return statusOrder[getSubscriptionStatus(a.subscription)] - statusOrder[getSubscriptionStatus(b.subscription)];
      });
  }, [students, filter]);

  const handleRenew = (student: Student) => {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);
    
    onUpdateSubscription(student.id, {
      startDate: getTodayString(),
      endDate: newEndDate.toISOString().split('T')[0],
      totalClasses: 8,
      usedClasses: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Абонементы</h2>
        
        <div className="flex gap-2">
          {(['all', 'active', 'expiring', 'expired', 'exhausted'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Все' : getSubscriptionStatusText(f)}
            </Button>
          ))}
        </div>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['active', 'expiring', 'expired', 'exhausted'] as const).map(status => {
          const count = students.filter(s => getSubscriptionStatus(s.subscription) === status).length;
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter(status)}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'active' ? 'bg-green-500' :
                    status === 'expiring' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <p className="text-sm text-muted-foreground">{getSubscriptionStatusText(status)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Список */}
      <div className="space-y-4">
        {filteredStudents.map(student => {
          const status = getSubscriptionStatus(student.subscription);
          const classesLeft = student.subscription.totalClasses - student.subscription.usedClasses;
          const daysLeft = Math.ceil(
            (new Date(student.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={student.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{student.fullName}</p>
                      <Badge variant={getSubscriptionStatusBadgeVariant(status)}>
                        {getSubscriptionStatusText(status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{classesLeft}</div>
                      <p className="text-xs text-muted-foreground">Занятий осталось</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{Math.max(0, daysLeft)}</div>
                      <p className="text-xs text-muted-foreground">Дней осталось</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{formatDate(student.subscription.endDate)}</div>
                      <p className="text-xs text-muted-foreground">Действует до</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Изменить
                    </Button>
                    {(status === 'expired' || status === 'exhausted') && (
                      <Button 
                        size="sm"
                        onClick={() => handleRenew(student)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Продлить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Диалог редактирования абонемента */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать абонемент</DialogTitle>
            <DialogDescription>{editingStudent?.fullName}</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Input
                    type="date"
                    value={editingStudent.subscription.startDate}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      subscription: { ...editingStudent.subscription, startDate: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Input
                    type="date"
                    value={editingStudent.subscription.endDate}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      subscription: { ...editingStudent.subscription, endDate: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Всего занятий</Label>
                  <Input
                    type="number"
                    value={editingStudent.subscription.totalClasses}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      subscription: { ...editingStudent.subscription, totalClasses: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Использовано</Label>
                  <Input
                    type="number"
                    value={editingStudent.subscription.usedClasses}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      subscription: { ...editingStudent.subscription, usedClasses: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                  Отмена
                </Button>
                <Button onClick={() => {
                  onUpdateSubscription(editingStudent.id, editingStudent.subscription);
                  setEditingStudent(null);
                }}>
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Главный компонент приложения
export default function Home() {
  const { students, isLoading: studentsLoading, addStudent, updateStudent, deleteStudent, updateSubscription } = useStudents();
  const { records, isLoading: recordsLoading, markAttendance, getStudentStats } = useAttendance();
  const { toast } = useToast();

  const handleAddStudent = (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    addStudent(data);
    toast({
      title: "Ученик добавлен",
      description: `${data.fullName} успешно добавлен в базу`,
    });
  };

  const handleUpdateStudent = (id: string, data: Partial<Student>) => {
    updateStudent(id, data);
    toast({
      title: "Данные обновлены",
      description: "Информация об ученике успешно обновлена",
    });
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    deleteStudent(id);
    toast({
      title: "Ученик удалён",
      description: `${student?.fullName} удалён из базы`,
      variant: "destructive"
    });
  };

  const handleMarkAttendance = (studentId: string, date: string, present: boolean) => {
    markAttendance(studentId, date, present);
    const student = students.find(s => s.id === studentId);
    toast({
      title: present ? "Присутствие отмечено" : "Отсутствие отмечено",
      description: `${student?.fullName} - ${date}`,
    });
  };

  if (studentsLoading || recordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Система учёта посещаемости</h1>
              <p className="text-sm text-muted-foreground">ИП &quot;Ландышев А.Н.&quot;</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Ученики</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Посещаемость</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Абонементы</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard students={students} records={records} />
          </TabsContent>

          <TabsContent value="students">
            <StudentsList
              students={students}
              onAdd={handleAddStudent}
              onEdit={handleUpdateStudent}
              onDelete={handleDeleteStudent}
            />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceView
              students={students}
              records={records}
              onMarkAttendance={handleMarkAttendance}
              onGetStats={getStudentStats}
            />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsView
              students={students}
              onUpdateSubscription={(id, sub) => {
                updateSubscription(id, sub);
                toast({
                  title: "Абонемент обновлён",
                  description: "Данные абонемента успешно сохранены",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 py-4 text-center text-sm text-muted-foreground">
        <p>Система учёта посещаемости © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
