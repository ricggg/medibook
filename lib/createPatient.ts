// FILE: lib/createPatient.ts
// Called from admin dashboard when adding a new patient
// Routes through Edge Function (safe — service_role stays server-side)
// Mirrors createDoctor.ts exactly

import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface CreatePatientInput {
  name:             string;
  email:            string;
  tempPassword:     string;
  clinicId:         string;
  age:              number;
  phone:            string;
  condition:        string;
  status:           string;
  bloodType:        string;
  address:          string;
  assignedDoctorId: string | null;
}

export interface CreatePatientResult {
  success: boolean;
  patient?: Record<string, unknown>;
  error?:   string;
}

// ─��───────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────
export async function createPatient(
  input: CreatePatientInput,
): Promise<CreatePatientResult> {

  // Get current session — Edge Function needs the JWT
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return {
      success: false,
      error:   'Not authenticated. Please log in again.',
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-patient`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey':        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify(input),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:   data.error ?? `Server error: ${response.status}`,
      };
    }

    return {
      success: true,
      patient: data.patient,
    };

  } catch (err) {
    console.error('createPatient error:', err);
    return {
      success: false,
      error:   'Network error. Please check your connection and try again.',
    };
  }
}