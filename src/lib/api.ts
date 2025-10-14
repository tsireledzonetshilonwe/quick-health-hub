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
};

// Minimal user type used by auth endpoints
export type UserDTO = {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
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

export async function createAppointment(dto: AppointmentCreateDTO) {
  return request(`/api/appointments`, { method: "POST", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
}

export async function updateAppointment(id: number, dto: AppointmentDTO) {
  return request(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
}

export async function deleteAppointment(id: number) {
  await request(`/api/appointments/${id}`, { method: "DELETE" });
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
