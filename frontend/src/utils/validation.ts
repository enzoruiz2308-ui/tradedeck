import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Introduce un email valido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(3, 'El username debe tener al menos 3 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirma tu contrasena.'),
    terms: z.boolean().refine(Boolean, 'Debes aceptar los terminos.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  });

export const listingSchema = z.object({
  type: z.enum(['sell', 'buy']),
  cardId: z.string().min(1, 'Selecciona una carta.'),
  tcg: z.enum(['pokemon', 'onepiece']),
  description: z.string().optional(),
  price: z.number().min(0.01, 'El precio debe ser mayor que cero.'),
  condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']),
  grading: z.object({
    company: z.enum(['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other']),
    grade: z.string().optional(),
    certificateNumber: z.string().optional(),
  }),
  status: z.enum(['active', 'reserved', 'sold', 'paused', 'expired']),
});

export const profileSchema = z.object({
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres.'),
  bio: z.string().max(180, 'La bio no puede superar 180 caracteres.').optional(),
  avatar: z.string().url('Introduce una URL valida.').optional().or(z.literal('')),
});

export const collectionItemSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad minima es 1.'),
  condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']),
  notes: z.string().max(180, 'Las notas no pueden superar 180 caracteres.').optional(),
  grading: z.object({
    company: z.enum(['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other']),
    grade: z.string().optional(),
    certificateNumber: z.string().optional(),
  }),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ListingForm = z.infer<typeof listingSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type CollectionItemForm = z.infer<typeof collectionItemSchema>;
