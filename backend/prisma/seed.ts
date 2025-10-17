import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quickhealth.com' },
    update: { roles: 'ADMIN' },
    create: {
      email: 'admin@quickhealth.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+1234567890',
      roles: 'ADMIN',
      active: true,
    },
  });
  console.log('✓ Admin user created:', admin.email);

  // Create test patient user
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: { roles: 'PATIENT' },
    create: {
      email: 'patient@test.com',
      password: patientPassword,
      fullName: 'John Doe',
      phone: '+1987654321',
      roles: 'PATIENT',
      active: true,
    },
  });
  console.log('✓ Test patient created:', patient.email);

  // Create sample appointment
  await prisma.appointment.create({
    data: {
      userId: patient.id,
      doctor: 'Dr. Sarah Smith',
      specialty: 'Cardiology',
      appointmentDate: new Date('2025-10-20T10:00:00Z'),
      endTime: new Date('2025-10-20T10:30:00Z'),
      reason: 'Routine checkup',
      status: 'PENDING',
    },
  });
  console.log('✓ Sample appointment created');

  // Create sample prescription
  await prisma.prescription.create({
    data: {
      userId: patient.id,
      medication: 'Aspirin',
      dosage: '100mg daily',
      instructions: 'Take with food',
      issuedAt: new Date('2025-10-15T09:00:00Z'),
      expiresAt: new Date('2025-11-15T09:00:00Z'),
      status: 'Active',
    },
  });
  console.log('✓ Sample prescription created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('Admin: admin@quickhealth.com / admin123');
  console.log('Patient: patient@test.com / patient123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
