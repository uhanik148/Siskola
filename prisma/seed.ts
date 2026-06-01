import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding (Safe Mode)...');

  // 1. Create Super Admin (Upsert - Aman dari Duplicate)
  const hashedSuperPassword = await hash('superadmin@#123', 10);
  const superAdmin = await prisma.admin.upsert({
    where: { username: 'siskolaadmin' },
    update: {}, // Jika sudah ada, jangan ubah apa-apa (atau update password jika perlu)
    create: {
      username: 'siskolaadmin',
      password: hashedSuperPassword,
      nama: 'Super Administrator',
      email: 'superadmin@sekolah.sch.id',
      role: 'super_admin',
    },
  });

  // 2. Create Default Admin
  const hashedAdminPassword = await hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      nama: 'Tata Usaha',
      email: 'admin@sekolah.sch.id',
      role: 'admin',
    },
  });

  console.log('✅ Users synced:');
  console.log('   - Super Admin: siskolaadmin');
  console.log('   - Admin: admin');

  // 3. Create sample students (Loop Upsert agar aman)
  const students = [
    {
      nis: '2024001',
      nisn: '1234567890',
      nama: 'Ahmad Fauzan',
      jenisKelamin: 'L',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('2010-05-15'),
      agama: 'Islam',
      alamat: 'Jl. Merdeka No. 10, Jakarta Selatan',
      telepon: '081234567890',
      namaAyah: 'Budi Santoso',
      pekerjaanAyah: 'Wiraswasta',
      namaIbu: 'Siti Aminah',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      teleponOrtu: '081234567891',
      kelas: '7A',
      tahunMasuk: '2024',
      status: 'aktif',
    },
    {
      nis: '2024002',
      nisn: '1234567891',
      nama: 'Putri Rahayu',
      jenisKelamin: 'P',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('2010-08-20'),
      agama: 'Islam',
      alamat: 'Jl. Asia Afrika No. 25, Bandung',
      telepon: '082345678901',
      namaAyah: 'Dedi Kurniawan',
      pekerjaanAyah: 'PNS',
      namaIbu: 'Rina Wati',
      pekerjaanIbu: 'Guru',
      teleponOrtu: '082345678902',
      kelas: '7A',
      tahunMasuk: '2024',
      status: 'aktif',
    },
  ];

  for (const s of students) {
    await prisma.siswa.upsert({
      where: { nis: s.nis },
      update: {},
      create: s,
    });
  }
  console.log('✅ Sample students synced');

  // 4. Create sample teachers
  const teachers = [
    {
      nip: '198501012010011001',
      nuptk: '1234567890123456',
      nama: 'Dr. Hendra Wijaya, M.Pd',
      jenisKelamin: 'L',
      tempatLahir: 'Surabaya',
      tanggalLahir: new Date('1985-01-01'),
      agama: 'Islam',
      alamat: 'Jl. Pahlawan No. 5, Surabaya',
      telepon: '083456789012',
      email: 'hendra.wijaya@sekolah.sch.id',
      jabatan: 'Kepala Sekolah',
      bidangStudi: 'Matematika',
      pendidikan: 'S3',
      jurusan: 'Pendidikan Matematika',
      tanggalMasuk: new Date('2010-01-01'),
      statusPegawai: 'aktif',
      jenisKontrak: 'PNS',
    },
    {
      nip: '199001012015012001',
      nuptk: '2345678901234567',
      nama: 'Ani Sulistyawati, S.Pd',
      jenisKelamin: 'P',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1990-01-01'),
      agama: 'Islam',
      alamat: 'Jl. Malioboro No. 15, Yogyakarta',
      telepon: '084567890123',
      email: 'ani.sulistya@sekolah.sch.id',
      jabatan: 'Guru',
      bidangStudi: 'Bahasa Indonesia',
      pendidikan: 'S1',
      jurusan: 'Pendidikan Bahasa Indonesia',
      tanggalMasuk: new Date('2015-01-01'),
      statusPegawai: 'aktif',
      jenisKontrak: 'PNS',
    },
  ];

  for (const t of teachers) {
    await prisma.guru.upsert({
      where: { nip: t.nip },
      update: {},
      create: t,
    });
  }
  console.log('✅ Sample teachers synced');

  // 5. Create sample inventory
  const inventory = [
    {
      kodeBarang: 'MJ-001',
      namaBarang: 'Meja Siswa',
      kategori: 'Mebeler',
      merk: 'Olympic',
      tahunPengadaan: 2023,
      jumlah: 100,
      satuan: 'unit',
      kondisi: 'baik',
      lokasi: 'Ruang Kelas 1A - 3C',
      sumberDana: 'BOS',
      hargaSatuan: 500000,
    },
    {
      kodeBarang: 'KP-001',
      namaBarang: 'Komputer Desktop',
      kategori: 'Elektronik',
      merk: 'Lenovo',
      tahunPengadaan: 2024,
      jumlah: 20,
      satuan: 'unit',
      kondisi: 'baik',
      lokasi: 'Lab Komputer',
      sumberDana: 'APBD',
      hargaSatuan: 8000000,
    },
  ];

  for (const i of inventory) {
    await prisma.sarpras.upsert({
      where: { kodeBarang: i.kodeBarang },
      update: {},
      create: i,
    });
  }
  console.log('✅ Sample inventory synced');

  // 6. Create sample activity
  await prisma.kegiatan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaKegiatan: 'Upacara Bendera',
      jenisKegiatan: 'upacara',
      tanggalMulai: new Date('2024-01-15'),
      waktuMulai: '07:00',
      waktuSelesai: '08:00',
      lokasi: 'Lapangan Sekolah',
      penanggungJawab: 'Dr. Hendra Wijaya, M.Pd',
      peserta: 'Seluruh Siswa dan Guru',
      jumlahPeserta: 500,
      deskripsi: 'Upacara bendera rutin setiap hari Senin',
      status: 'selesai',
    },
  });
  console.log('✅ Sample activity synced');

  // Log seeding activity
  // Selalu catat log agar admin tahu seeding dijalankan
  await prisma.activityLog.create({
    data: {
      adminId: superAdmin.id,
      action: 'seed',
      module: 'system',
      description: 'Menjalankan database seeding',
      metadata: {
        info: 'Upsert mode (Safe Seeding)',
      },
    },
  });

  console.log('✅ Activity log created');
  console.log('🎉 Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
