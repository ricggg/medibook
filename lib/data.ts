import { Doctor, Appointment, MedicalRecord, Specialty, Testimonial, FAQ } from './types';

export const SPECIALTIES: Specialty[] = [
  { name: 'Cardiology', icon: '❤️', count: 45 },
  { name: 'Dermatology', icon: '✨', count: 38 },
  { name: 'Pediatrics', icon: '👶', count: 52 },
  { name: 'Orthopedics', icon: '🦴', count: 41 },
  { name: 'Neurology', icon: '🧠', count: 29 },
  { name: 'General Medicine', icon: '🏥', count: 67 },
  { name: 'Dentistry', icon: '🦷', count: 55 },
  { name: 'Ophthalmology', icon: '👁️', count: 33 }
];

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    rating: 4.9,
    experience: 15,
    consultationFee: 120,
    nextAvailable: 'Today, 2:30 PM',
    hospital: 'Central Medical Center'
  },
];

export const APPOINTMENTS: Appointment[] = [];
export const MEDICAL_RECORDS: MedicalRecord[] = [];
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rachel Martinez',
    location: 'New York, NY',
    rating: 5,
    text: 'Booked a dermatologist in under 2 minutes. The interface is incredibly intuitive!',
    date: 'April 2024'
  },
];
export const FAQS: FAQ[] = [
  {
    question: 'How do I book an appointment?',
    answer: 'Simply sign up, search for a doctor, select a time slot, and confirm your booking.'
  },
];
export const TRUST_STATS = {
  doctors: '500+',
  appointments: '50,000+',
  rating: '4.9',
  cities: '50+'
};