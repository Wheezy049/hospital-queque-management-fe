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

export type QuequeStatus = "WAITING" | "ACTIVE" | "DONE";

export type QuequeItem = {
  id: string;
  appointmentId: string;
  position: number;
  status: QuequeStatus;
  createdAt: string;
};

export type NextQuequeItem = {
  appointmentId: string;
  position: number;
  status: QuequeStatus;
}