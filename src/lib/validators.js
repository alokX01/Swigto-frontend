import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const restaurantOwnerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const agentRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  vehicle_type: z.enum(['BIKE', 'SCOOTER', 'BICYCLE']),
  vehicle_number: z.string().min(1, 'Vehicle number is required').max(15),
  driving_license: z.string().min(1, 'Driving license is required').max(20),
});

export const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
  formatted_address: z.string().optional(),
  address_line: z.string().min(3, 'Address is required').max(250),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  flat_number: z.string().min(1, 'Flat/House number is required').max(100),
  receiver_phone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10-15 digits)'),
  lat: z.string().optional().nullable(),
  long: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  review: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});
