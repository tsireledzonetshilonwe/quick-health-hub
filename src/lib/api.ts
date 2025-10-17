// Simple fetch-based API client for auth and prescriptions
// Use Vite env var VITE_API_BASE if provided, otherwise default to relative paths
export const API_BASE = (import.meta.env as any).VITE_API_BASE ?? "";

type SignupPayload = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: UserDTO;
};

export async function signup(payload: SignupPayload) {
  return request(`/api/auth/signup`, { method: "POST", body: JSON.stringify(payload) }) as Promise<UserDTO>;
}

export async function login(payload: LoginPayload) {
  // Send the login payload as { email, password } to match AuthRequest DTO on the server
  return request(`/api/auth/login`, { method: "POST", body: JSON.stringify(payload) }) as Promise<AuthResponse>;
}

export type PrescriptionDTO = {
  id?: number;
  userId: number;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedAt: string; // ISO string, e.g. "2025-10-14T12:00:00Z"
  expiresAt?: string; // ISO string
  status?: string;
  patientName?: string;
  patientEmail?: string;
};

// Minimal user type used by auth endpoints
export type UserDTO = {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles?: string[]; // e.g., ["ADMIN", "PATIENT"], present if backend includes roles
};

async function request(path: string, options: RequestInit = {}) {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ? (options.headers as Record<string, string>) : {}),
    },
  };
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
  const text = await res.text();
  if (!res.ok) {
    const err: any = new Error(text || res.statusText || "Request failed");
    err.status = res.status;
    throw err;
  }
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function getPrescriptions(userId?: number): Promise<PrescriptionDTO[]> {
  const q = userId ? `?userId=${userId}` : "";
  return request(`/api/prescriptions${q}`, { method: "GET" }) as Promise<PrescriptionDTO[]>;
}

export async function getPrescription(id: number): Promise<PrescriptionDTO> {
  return request(`/api/prescriptions/${id}`, { method: "GET" }) as Promise<PrescriptionDTO>;
}

export async function createPrescription(dto: PrescriptionDTO): Promise<PrescriptionDTO> {
  return request(`/api/prescriptions`, {
    method: "POST",
    body: JSON.stringify(dto),
  }) as Promise<PrescriptionDTO>;
}

export async function updatePrescription(id: number, dto: PrescriptionDTO): Promise<PrescriptionDTO> {
  return request(`/api/prescriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  }) as Promise<PrescriptionDTO>;
}

export async function deletePrescription(id: number): Promise<void> {
  await request(`/api/prescriptions/${id}`, { method: "DELETE" });
}

// Appointments
export type AppointmentDTO = {
  id?: number;
  userId?: number;
  doctor: string;
  specialty: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  reason?: string;
  status?: string;   // Only if present in backend
  patientName?: string;
  patientEmail?: string;
};

export type AppointmentCreateDTO = {
  doctor: string;
  specialty: string;
  startTime: string; // ISO string
  endTime?: string;
  reason?: string;
};

export async function getAppointments(userId?: number) {
  const q = userId ? `?userId=${userId}` : "";
  return request(`/api/appointments${q}`, { method: "GET" }) as Promise<AppointmentDTO[]>;
}

export async function getAppointment(id: number): Promise<AppointmentDTO> {
  return request(`/api/appointments/${id}`, { method: "GET" }) as Promise<AppointmentDTO>;
}

export async function createAppointment(dto: AppointmentCreateDTO) {
  return request(`/api/appointments`, { method: "POST", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
}

export async function updateAppointment(id: number, dto: AppointmentDTO) {
  return request(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
}

export async function deleteAppointment(id: number) {
  await request(`/api/appointments/${id}`, { method: "DELETE" });
}

// Users (admin and self endpoints)
export async function getUsers() {
  return request(`/api/users`, { method: "GET" }) as Promise<UserDTO[]>;
}

export async function getUser(id: number) {
  return request(`/api/users/${id}`, { method: "GET" }) as Promise<UserDTO>;
}

export async function createUser(u: UserDTO) {
  return request(`/api/users`, { method: "POST", body: JSON.stringify(u) }) as Promise<UserDTO>;
}

export async function updateUser(id: number, u: Partial<UserDTO>) {
  return request(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(u) }) as Promise<UserDTO>;
}

export async function deleteUser(id: number) {
  await request(`/api/users/${id}`, { method: "DELETE" });
}

// Update current authenticated user's own profile
export type UpdateMePayload = { email: string; fullName?: string; phone?: string };
export async function updateMe(payload: UpdateMePayload) {
  return request(`/api/users/me`, { method: "PUT", body: JSON.stringify(payload) }) as Promise<UserDTO>;
}

// Fetch current user by email via query param contract: /api/users/me?email=...
export async function getMe(email: string) {
  const q = new URLSearchParams({ email }).toString();
  return request(`/api/users/me?${q}`, { method: "GET" }) as Promise<UserDTO>;
}

// Contact
export type ContactMessageDTO = {
  id?: number;
  name: string;
  email: string;
  message: string;
  createdAt?: string; // ISO string if present in backend
};

export async function submitContact(msg: ContactMessageDTO) {
  return request(`/api/contact`, { method: "POST", body: JSON.stringify(msg) }) as Promise<ContactMessageDTO>;
}

// Health check
export async function health() {
  return request(`/api/health`, { method: "GET" }) as Promise<string>;
}

// Doctors (list for selection)
// (doctors and user/profile endpoints removed — backend exposes only auth, contact, appointments, prescriptions, and health)

// (avatar upload removed)

// ===================== ADMIN API =====================
// Types
export type AdminUser = UserDTO & { active?: boolean; roles?: string[] };
export type AdminAppointment = AppointmentDTO;
export type AdminPrescription = PrescriptionDTO;
export type AdminContactMessage = ContactMessageDTO;

// Admin - Users
export async function adminGetUsers() {
  return request(`/api/admin/users`, { method: "GET" }) as Promise<AdminUser[]>;
}

export async function adminGetUser(id: number) {
  return request(`/api/admin/users/${id}`, { method: "GET" }) as Promise<AdminUser>;
}

export async function adminUpdateUser(id: number, u: Partial<AdminUser>) {
  return request(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(u) }) as Promise<AdminUser>;
}

export async function adminSetUserRoles(id: number, roles: string[]) {
  return request(`/api/admin/users/${id}/roles`, { method: "PATCH", body: JSON.stringify(roles) }) as Promise<AdminUser>;
}

export async function adminActivateUser(id: number) {
  return request(`/api/admin/users/${id}/activate`, { method: "PATCH" }) as Promise<void>;
}

export async function adminDeactivateUser(id: number) {
  return request(`/api/admin/users/${id}/deactivate`, { method: "PATCH" }) as Promise<void>;
}

export async function adminDeleteUser(id: number) {
  await request(`/api/admin/users/${id}`, { method: "DELETE" });
}

// Admin - Appointments
export async function adminGetAppointments() {
  return request(`/api/admin/appointments`, { method: "GET" }) as Promise<AdminAppointment[]>;
}

export async function adminGetAppointment(id: number) {
  return request(`/api/admin/appointments/${id}`, { method: "GET" }) as Promise<AdminAppointment>;
}

export async function adminUpdateAppointment(id: number, dto: Partial<AdminAppointment>) {
  return request(`/api/admin/appointments/${id}`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<AdminAppointment>;
}

export async function adminDeleteAppointment(id: number) {
  await request(`/api/admin/appointments/${id}`, { method: "DELETE" });
}

// Admin - Prescriptions
export async function adminGetPrescriptions() {
  return request(`/api/admin/prescriptions`, { method: "GET" }) as Promise<AdminPrescription[]>;
}

export async function adminGetPrescription(id: number) {
  return request(`/api/admin/prescriptions/${id}`, { method: "GET" }) as Promise<AdminPrescription>;
}

export async function adminUpdatePrescription(id: number, dto: Partial<AdminPrescription>) {
  return request(`/api/admin/prescriptions/${id}`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<AdminPrescription>;
}

export async function adminDeletePrescription(id: number) {
  await request(`/api/admin/prescriptions/${id}`, { method: "DELETE" });
}

// Admin - Contact Messages
export async function adminGetContactMessages() {
  return request(`/api/admin/contact-messages`, { method: "GET" }) as Promise<AdminContactMessage[]>;
}

export async function adminGetContactMessage(id: number) {
  return request(`/api/admin/contact-messages/${id}`, { method: "GET" }) as Promise<AdminContactMessage>;
}

export async function adminDeleteContactMessage(id: number) {
  await request(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
}
