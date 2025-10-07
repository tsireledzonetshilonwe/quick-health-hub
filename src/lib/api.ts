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
  user?: UserProfileDTO;
};

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If server uses cookie-based CSRF tokens (Spring Security default stores a cookie named 'XSRF-TOKEN'),
  // include it as the X-XSRF-TOKEN header for unsafe methods so the server won't reject the request.
  const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  const method = ((options.method || "GET") as string).toUpperCase();

  // read XSRF token cookie if present
  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const pairs = document.cookie.split(/;\s*/);
    for (const p of pairs) {
      const [k, ...v] = p.split("=");
      if (k === name) return decodeURIComponent(v.join("="));
    }
    return null;
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    // include cookies for server-side session authentication
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (unsafeMethods.includes(method)) {
    const xsrf = getCookie("XSRF-TOKEN") || getCookie("X-XSRF-TOKEN");
    if (xsrf) {
      (fetchOptions.headers as Record<string, string>)["X-XSRF-TOKEN"] = xsrf;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
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
  userId?: string;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedAt: string; // ISO
  expiresAt?: string; // ISO
  status?: string;
};

export async function getPrescriptions(): Promise<PrescriptionDTO[]> {
  try {
    return await request(`/api/prescriptions`, { method: "GET" }) as Promise<PrescriptionDTO[]>;
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 500) {
      // try a quick profile refresh which may re-establish session context, then retry once
      try {
        await getProfile();
      } catch (e) {
        // ignore
      }
      return request(`/api/prescriptions`, { method: "GET" }) as Promise<PrescriptionDTO[]>;
    }
    throw err;
  }
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

// Payload expected by the backend when creating an appointment
export type AppointmentCreateDTO = {
  doctor: string;
  specialty: string;
  startTime: string; // ISO instant string, e.g. 2025-10-06T14:00:00Z
  endTime?: string; // ISO
  reason?: string;
};

export async function getAppointments(userId?: string) {
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return request(`/api/appointments${q}`, { method: "GET" }) as Promise<AppointmentDTO[]>;
}

export async function createAppointment(dto: AppointmentCreateDTO) {
  try {
    return await request(`/api/appointments`, { method: "POST", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
  } catch (err: any) {
    if (err?.status === 401) {
      // try to refresh the profile/session using all known profile endpoints, then retry once
      try {
        await getProfile();
      } catch (e) {
        // ignore refresh errors
      }
      return request(`/api/appointments`, { method: "POST", body: JSON.stringify(dto) }) as Promise<AppointmentDTO>;
    }
    throw err;
  }
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
export type UserProfileDTO = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string; // data URL or image path
};

// DTO used by the backend for profile updates
export type ProfileUpdateDTO = {
  fullName: string;
  phone?: string;
};

export async function getProfile() {
  return request(`/api/auth/me`, { method: "GET" }) as Promise<UserProfileDTO>;
}

export async function updateProfile(dto: ProfileUpdateDTO) {
  return request(`/api/auth/me`, { method: "PUT", body: JSON.stringify(dto) }) as Promise<UserProfileDTO>;
}

// Upload avatar (multipart/form-data)
export async function uploadAvatar(file: File) {
  const token = localStorage.getItem("accessToken");
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
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
