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

type AuthResponse = {
  accessToken: string;
  expiresIn: number; // seconds
};

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  // Detailed debug logging when VITE_API_DEBUG is set
  const debug = (import.meta.env as any).VITE_API_DEBUG;
  if (debug) {
    try {
      const method = (options.method || "GET").toUpperCase();
      // avoid logging the Authorization header value
      const loggedHeaders = { ...(options.headers as Record<string, string> || {}) };
      if (loggedHeaders.Authorization) loggedHeaders.Authorization = "<redacted>";
      // try to stringify body if present
      let bodyPreview: any = null;
      if (options.body) {
        try {
          bodyPreview = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
        } catch (e) {
          bodyPreview = options.body;
        }
      }
      // eslint-disable-next-line no-console
      console.debug("API request:", { method, url: `${API_BASE}${path}`, headers: loggedHeaders, body: bodyPreview });
    } catch (e) {
      // ignore logging errors
    }
  }

  const text = await res.text();
  if (!res.ok) {
    const message = text || res.statusText || "Request failed";
    const err: any = new Error(message);
    err.status = res.status;
    // Debug logging when VITE_API_DEBUG is set
    const debug = (import.meta.env as any).VITE_API_DEBUG;
    if (debug) {
      // eslint-disable-next-line no-console
      console.error("API request failed:", { url: `${API_BASE}${path}`, status: res.status, body: text });
    }
    throw err;
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
}

export async function signup(payload: SignupPayload) {
  return request(`/api/auth/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PrescriptionDTO = {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  doctor: string;
  startDate: string; // ISO
  endDate: string; // ISO
  status?: string;
};

export async function getPrescriptions(): Promise<PrescriptionDTO[]> {
  return request(`/api/prescriptions`, { method: "GET" });
}

export async function getPrescription(id: string): Promise<PrescriptionDTO> {
  return request(`/api/prescriptions/${id}`, { method: "GET" });
}

export async function createPrescription(dto: PrescriptionDTO) {
  return request(`/api/prescriptions`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updatePrescription(id: string, dto: PrescriptionDTO) {
  return request(`/api/prescriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function deletePrescription(id: string) {
  return request(`/api/prescriptions/${id}`, { method: "DELETE" });
}

// Appointments
export type AppointmentDTO = {
  id?: string;
  userId?: string;
  doctor: string;
  specialty: string;
  startTime: string; // ISO
  endTime?: string; // ISO
  reason?: string;
  status?: string;
};

export async function getAppointments(userId?: string) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return request(`/api/appointments${q}`, { method: "GET" }) as Promise<AppointmentDTO[]>;
}

export async function createAppointment(dto: AppointmentDTO) {
  return request(`/api/appointments`, { method: "POST", body: JSON.stringify(dto) });
}

export async function updateAppointment(id: string, dto: AppointmentDTO) {
  return request(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}

export async function deleteAppointment(id: string) {
  return request(`/api/appointments/${id}`, { method: "DELETE" });
}

// Contact
export type ContactMessageDTO = {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
};

export async function submitContact(msg: { name: string; email: string; message: string }) {
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
  return request(`/api/doctors`, { method: "GET" }) as Promise<DoctorDTO[]>;
}

// Profile
export type UserProfileDTO = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string; // data URL or image path
};

export async function getProfile() {
  return request(`/api/auth/me`, { method: "GET" }) as Promise<UserProfileDTO>;
}

export async function updateProfile(dto: UserProfileDTO) {
  return request(`/api/auth/me`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<UserProfileDTO>;
}
