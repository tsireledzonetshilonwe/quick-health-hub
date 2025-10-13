// Simple fetch-based API client for auth and prescriptions
// Use Vite env var VITE_API_BASE if provided, otherwise default to relative paths
export const API_BASE =
  (import.meta.env as any).VITE_API_BASE ??
  ((typeof window !== "undefined" && window.location.hostname === "localhost")
    ? "http://localhost:8080"
    : "");

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
  userId: number;
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
export type DoctorDTO = {
  id?: string;
  fullName: string;
  specialty?: string;
};

export async function getDoctors() {
  const candidates = [`/api/doctors`, `/doctors`, `/api/doctor`, `/doctor`, `/api/v1/doctors`, `/v1/doctors`, `/api/providers`, `/providers`];
  for (const p of candidates) {
    try {
      const res = await request(p, { method: "GET" }) as DoctorDTO[];
      if (res && Array.isArray(res)) return res;
    } catch (e: any) {
      if (e?.status && e.status !== 404) throw e;
      // else continue
    }
  }
  return request(`/api/doctors`, { method: "GET" }) as Promise<DoctorDTO[]>;
}

// Profile
export type UserDTO = {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export async function getProfile() {
  return request(`/api/auth/me`, { method: "GET" }) as Promise<UserDTO>;
}

export async function updateProfile(dto: { fullName: string; phone?: string; }) {
  return request(`/api/auth/me`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<UserDTO>;
}

// Upload avatar (multipart/form-data)
export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  // read xsrf cookie if available
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const pairs = document.cookie.split(/;\s*/);
    for (const p of pairs) {
      const [k, ...v] = p.split("=");
      if (k === name) return decodeURIComponent(v.join("="));
    }
    return null;
  };
  const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  const res = await fetch(`${API_BASE}/api/auth/me/avatar`, {
    method: "POST",
    credentials: "include",
    headers: Object.keys(headers).length ? headers : undefined,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as { url: string };
}
