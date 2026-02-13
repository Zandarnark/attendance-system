'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  Subscription,
  getSubscriptionStatus 
} from '@/types';

const STUDENTS_KEY = 'attendance_students';
const ATTENDANCE_KEY = 'attendance_records';

// Генератор уникального ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Безопасное чтение из localStorage
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Безопасная запись в localStorage
function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    console.error('Failed to save to localStorage');
  }
}

// Хук для работы с учениками
export function useStudents() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = safeGetItem(STUDENTS_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Сохранение при изменении
  const saveAndSetStudents = useCallback((newStudents: Student[]) => {
    safeSetItem(STUDENTS_KEY, JSON.stringify(newStudents));
    setStudents(newStudents);
  }, []);

  const addStudent = useCallback((
    data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    saveAndSetStudents([...students, newStudent]);
    return newStudent;
  }, [students, saveAndSetStudents]);

  const updateStudent = useCallback((
    id: string, 
    data: Partial<Omit<Student, 'id' | 'createdAt'>>
  ) => {
    const updated = students.map(student => 
      student.id === id 
        ? { ...student, ...data, updatedAt: new Date().toISOString() }
        : student
    );
    saveAndSetStudents(updated);
  }, [students, saveAndSetStudents]);

  const deleteStudent = useCallback((id: string) => {
    const updated = students.filter(student => student.id !== id);
    saveAndSetStudents(updated);
    
    // Удаляем записи посещаемости
    const savedAttendance = safeGetItem(ATTENDANCE_KEY);
    if (savedAttendance) {
      try {
        const attendance: AttendanceRecord[] = JSON.parse(savedAttendance);
        const filtered = attendance.filter(a => a.studentId !== id);
        safeSetItem(ATTENDANCE_KEY, JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
  }, [students, saveAndSetStudents]);

  const getStudent = useCallback((id: string) => {
    return students.find(s => s.id === id);
  }, [students]);

  // Обновление абонемента
  const updateSubscription = useCallback((
    studentId: string, 
    subscription: Partial<Subscription>
  ) => {
    const updated = students.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            subscription: { ...student.subscription, ...subscription },
            updatedAt: new Date().toISOString() 
          }
        : student
    );
    saveAndSetStudents(updated);
  }, [students, saveAndSetStudents]);

  // Использовать занятие
  const useClass = useCallback((studentId: string) => {
    const updated = students.map(student => {
      if (student.id === studentId) {
        const newUsedClasses = Math.min(
          student.subscription.usedClasses + 1,
          student.subscription.totalClasses
        );
        return {
          ...student,
          subscription: {
            ...student.subscription,
            usedClasses: newUsedClasses
          },
          updatedAt: new Date().toISOString()
        };
      }
      return student;
    });
    saveAndSetStudents(updated);
  }, [students, saveAndSetStudents]);

  // Статистика
  const getStats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => 
      getSubscriptionStatus(s.subscription) === 'active'
    ).length;
    const expiring = students.filter(s => 
      getSubscriptionStatus(s.subscription) === 'expiring'
    ).length;
    const expired = students.filter(s => 
      ['expired', 'exhausted'].includes(getSubscriptionStatus(s.subscription))
    ).length;

    return { total, active, expiring, expired };
  }, [students]);

  return {
    students,
    isLoading: false,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    updateSubscription,
    useClass,
    getStats,
  };
}

// Хук для работы с посещаемостью
export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = safeGetItem(ATTENDANCE_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Сохранение при изменении
  const saveAndSetRecords = useCallback((newRecords: AttendanceRecord[]) => {
    safeSetItem(ATTENDANCE_KEY, JSON.stringify(newRecords));
    setRecords(newRecords);
  }, []);

  // Отметить посещение
  const markAttendance = useCallback((
    studentId: string, 
    date: string, 
    present: boolean,
    notes?: string
  ) => {
    const existingIndex = records.findIndex(
      r => r.studentId === studentId && r.date === date
    );

    let updated: AttendanceRecord[];
    
    if (existingIndex >= 0) {
      updated = records.map((r, i) => 
        i === existingIndex 
          ? { ...r, present, notes, createdAt: new Date().toISOString() }
          : r
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: generateId(),
        studentId,
        date,
        present,
        notes,
        createdAt: new Date().toISOString(),
      };
      updated = [...records, newRecord];
    }
    
    saveAndSetRecords(updated);
  }, [records, saveAndSetRecords]);

  // Получить записи по дате
  const getRecordsByDate = useCallback((date: string) => {
    return records.filter(r => r.date === date);
  }, [records]);

  // Получить записи по ученику
  const getRecordsByStudent = useCallback((studentId: string) => {
    return records.filter(r => r.studentId === studentId);
  }, [records]);

  // Получить статистику посещаемости ученика
  const getStudentStats = useCallback((studentId: string) => {
    const studentRecords = records.filter(r => r.studentId === studentId);
    const total = studentRecords.length;
    const present = studentRecords.filter(r => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  }, [records]);

  // Удалить запись
  const deleteRecord = useCallback((id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveAndSetRecords(updated);
  }, [records, saveAndSetRecords]);

  return {
    records,
    isLoading: false,
    markAttendance,
    getRecordsByDate,
    getRecordsByStudent,
    getStudentStats,
    deleteRecord,
  };
}
