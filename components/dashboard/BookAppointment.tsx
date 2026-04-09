"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DOCTORS, SPECIALTIES } from '@/lib/data';

export default function BookAppointment() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'search' | 'select' | 'confirm'>('search');

  const filteredDoctors = DOCTORS.filter(doctor => {
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    const matchesSearch = !searchQuery || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b-2 border-[var(--border-card)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#10b981] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">➕</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--text-section)]">Book Appointment</h2>
          <p className="text-xs text-[var(--text-light)]">Find and book verified doctors</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <Input
          icon="🔍"
          placeholder="Search by doctor name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Specialty Filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              !selectedSpecialty
                ? 'bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] text-white shadow-lg'
                : 'bg-[var(--bg-card-elevated)] text-[var(--text-muted)] hover:bg-[var(--border-card)]'
            }`}
          >
            All Specialties
          </button>
          {SPECIALTIES.map(specialty => (
            <button
              key={specialty.name}
              onClick={() => setSelectedSpecialty(specialty.name)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === specialty.name
                  ? 'bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] text-white shadow-lg'
                  : 'bg-[var(--bg-card-elevated)] text-[var(--text-muted)] hover:bg-[var(--border-card)]'
              }`}
            >
              {specialty.icon} {specialty.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-card)] hover:shadow-lg transition-all"
          >
            {/* Doctor Header */}
            <div className="flex gap-3 mb-3">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#2563eb]"
              />
              <div className="flex-1">
                <h3 className="font-bold text-[var(--text-primary)]">{doctor.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-1">{doctor.specialty}</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-bold text-[var(--text-primary)]">{doctor.rating}</span>
                  <span className="text-[var(--text-muted)]">({doctor.experience}y exp)</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <span>🏥</span>
                <span>{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="font-bold text-[var(--text-primary)]">${doctor.consultationFee}</span>
                <span>consultation fee</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span className="text-green-600 font-semibold">Next: {doctor.nextAvailable}</span>
              </div>
            </div>

            {/* Book Button */}
            <Button 
              fullWidth 
              size="sm"
              onClick={() => {
                setSelectedDoctor(doctor.id);
                alert(`Booking appointment with ${doctor.name}...\n\nIn production, this would open a time slot selector and confirmation flow.`);
              }}
            >
              Book Appointment
            </Button>
          </motion.div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold">No doctors found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </Card>
  );
}