// FILE: supabase/functions/create-user/index.ts
// Deploy with: supabase functions deploy create-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verify the calling user is an admin ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client with caller's JWT — used to verify they are admin
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: callerUser }, error: callerError } =
      await callerClient.auth.getUser();

    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is admin
    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Parse request body ──
    const body = await req.json();
    const {
      email,
      password,
      full_name,
      role,         // 'doctor' | 'patient'
      clinic_id,
      // Doctor-specific
      specialty,
      experience,
      phone,
      initials,
      grad,
      // Patient-specific
      age,
      condition,
      blood_type,
      address,
      assigned_doctor_id,
      status: userStatus,
    } = body;

    if (!email || !password || !role || !clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, role, clinic_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['doctor', 'patient'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Role must be doctor or patient' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 3. Create auth user with service role ──
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email:         email.trim().toLowerCase(),
        password,
        email_confirm: true, // Skip email confirmation — admin is creating this
        user_metadata: {
          full_name: full_name?.trim() ?? '',
          role,
          clinic_id,
        },
      });

    if (createError) {
      // Handle "user already exists" gracefully
      if (createError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({
            error: `A user with email ${email} already exists. Use a different email.`
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = newUser.user.id;

    // ── 4. Wait for trigger to create profile, then update it ──
    await new Promise(r => setTimeout(r, 800));

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id:        newUserId,
        role,
        full_name: full_name?.trim() ?? '',
        email:     email.trim().toLowerCase(),
        clinic_id,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError.message);
      // Non-fatal — profile was likely created by trigger
    }

    // ── 5. Insert role-specific record ──
    if (role === 'doctor') {
      const cleanName = (full_name ?? '').trim().startsWith('Dr.')
        ? (full_name ?? '').trim()
        : `Dr. ${(full_name ?? '').trim()}`;

      const doctorInitials = initials ?? cleanName
        .replace('Dr. ', '')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const { error: doctorError } = await adminClient
        .from('doctors')
        .insert({
          clinic_id,
          profile_id:  newUserId,
          name:        cleanName,
          email:       email.trim().toLowerCase(),
          specialty:   specialty ?? '',
          experience:  experience ?? '',
          phone:       phone ?? '',
          initials:    doctorInitials,
          grad:        grad ?? 'linear-gradient(135deg, #1e3c7d, #2563eb)',
          status:      'active',
          rating:      5.0,
          patients:    0,
          utilization: 0,
          revenue:     0,
        });

      if (doctorError) {
        console.error('Doctor insert error:', doctorError.message);
        // Clean up — delete the auth user since doctor record failed
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: `Failed to create doctor record: ${doctorError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the newly created doctor record
      const { data: doctorRecord } = await adminClient
        .from('doctors')
        .select('*')
        .eq('profile_id', newUserId)
        .single();

      return new Response(
        JSON.stringify({
          success:    true,
          user_id:    newUserId,
          role:       'doctor',
          doctor:     doctorRecord,
          message:    `Doctor account created. They can now log in with ${email}.`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (role === 'patient') {
      const { error: patientError } = await adminClient
        .from('patients')
        .insert({
          clinic_id,
          profile_id:         newUserId,
          assigned_doctor_id: assigned_doctor_id ?? null,
          name:               (full_name ?? '').trim(),
          email:              email.trim().toLowerCase(),
          age:                Number(age) || 0,
          phone:              phone ?? '',
          condition:          condition ?? '',
          status:             userStatus ?? 'active',
          blood_type:         blood_type ?? '',
          address:            address ?? '',
          last_visit:         'Not yet visited',
          visits:             0,
        });

      if (patientError) {
        console.error('Patient insert error:', patientError.message);
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: `Failed to create patient record: ${patientError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: patientRecord } = await adminClient
        .from('patients')
        .select('*')
        .eq('profile_id', newUserId)
        .single();

      return new Response(
        JSON.stringify({
          success:   true,
          user_id:   newUserId,
          role:      'patient',
          patient:   patientRecord,
          message:   `Patient account created. They can log in with ${email}.`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (err) {
    console.error('Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});