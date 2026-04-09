export type UserRole = 'patient' | 'doctor';

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  experience: number;
  consultationFee: number;
  nextAvailable: string;
  hospital: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  hospital: string;
  doctorImage: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface Specialty {
  name: string;
  icon: string;
  count: number;
}

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

export interface FAQ {
  question: string;
  answer: string;
}