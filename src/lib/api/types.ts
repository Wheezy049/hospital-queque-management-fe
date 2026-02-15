export type Role = "ADMIN" | "PATIENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Department = {
  id: string;
  name: string;
  hospitalId?: string;
};

export type AppointmentStatus = "PENDING" | "WAITING" | "DONE" | "CANCELLED";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  departmentId: string;
  patientId: string;
};

export type QueueStatus = "WAITING" | "ACTIVE" | "DONE";

export type QueueItem = {
  id: string;
  appointmentId: string;
  position: number;
  status: QueueStatus;
  createdAt: string;
};