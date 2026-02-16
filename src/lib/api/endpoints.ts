import { http } from "./http";
import type { Appointment, Department, NextQuequeItem, QuequeItem, User } from "./types";

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      http<{ token: string; user?: User }, { email: string; password: string }>("/auth/login", {
        method: "POST",
        body,
        auth: false,
      }),
    me: () => http<User>("/auth/me"),
  },

  appointments: {
  create: (body: { departmentId: string; hospitalId: string; date: string; time: string }) =>
    http<
      {
        appointmentId: string;
        scheduledAt: string;
        status: string;
        queue: { position: number; status: string };
      },
      typeof body
    >("/appointments/create-appointment", {
      method: "POST",
      body,
    }),

  my: (params?: { type?: "past" | "upcoming" }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return http<Appointment[]>(`/appointments/my-appointments${suffix}`);
  },

  complete: (id: string) =>
    http<{ message: string; appointmentId: string; status: string }>(`/appointments/${id}/complete`, {
      method: "PATCH",
    }),

  cancel: (id: string) =>
    http<{ message: string; appointmentId: string; status: string }>(`/appointments/${id}/cancel`, {
      method: "PATCH",
    }),
},

  departments: {
  list: (params?: { hospitalId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.hospitalId) qs.set("hospitalId", params.hospitalId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return http<Department[]>(`/departments/get-departments${suffix}`);
  },

  create: (body: { name: string; hospitalId: string }) =>
    http<Department, typeof body>("/departments/create-department", {
      method: "POST",
      body,
    }),
},

  queue: {
  listAdmin: (params: { departmentId: string; date?: string }) => {
    const qs = new URLSearchParams({ departmentId: params.departmentId });
    if (params.date) qs.set("date", params.date);
    return http<QuequeItem[]>(`/queque/get-queque?${qs.toString()}`);
  },

  next: (body: { departmentId: string; date?: string }) =>
    http<NextQuequeItem, typeof body>("/queque/next", { method: "POST", body }),

  move: (id: string, direction: "UP" | "DOWN") =>
    http<{ id: string; position: number; status: string }, { direction: "UP" | "DOWN" }>(
      `/queque/${id}/move`,
      { method: "PATCH", body: { direction } }
    ),
}
};
