export type Role = "SUPER_ADMIN" | "ADMIN" | "PATIENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  department?: { id: string; name: string };
};

export type Department = {
  id: string;
  name: string;
  hospitalId?: string;
};

export type AppointmentStatus = "PENDING" | "WAITING" | "DONE" | "CANCELLED";

export type Appointment = {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  description?: string;
  duration?: number;
  notes?: string;
  estimatedWaitTime?: number;
  department: {
    id: string;
    name: string;
    hospital: { name: string };
  };
  queue?: {
    position: number;
    status: QueueStatus;
  };
  patientId?: string;
  patient?: {
    id: string;
    name: string;
    email: string;
  };
};

export type QueueStatus = "WAITING" | "ACTIVE" | "DONE";

export type QueueItem = {
  id: string;
  appointmentId?: string;
  position: number;
  status: QueueStatus;
  createdAt?: string;
  scheduledAt?: string;
  appointment?: {
    id: string;
    patient?: {
      name: string;
      email?: string;
    };
  };
};

export type NextQueueItem = {
  appointmentId: string;
  position: number;
  status: QueueStatus;
};

export type Hospital = {
  id: string;
  name: string;
};