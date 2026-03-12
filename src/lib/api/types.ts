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
  scheduledAt: string;
  status: AppointmentStatus;
  department: {
    name: string;
    hospital: { name: string };
  };
  queue?: {
    position: number;
    status: QuequeStatus;
  };
  patientId?: string;
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