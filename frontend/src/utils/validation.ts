import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Introduce un email válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(3, 'El username debe tener al menos 3 caracteres.'),
    confirmPassword: z.string().min(6, 'Confirma tu contraseña.'),
    terms: z.boolean().refine(Boolean, 'Debes aceptar los términos.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const listingSchema = z.object({
  type: z.enum(['sell', 'buy']),
  cardId: z.string().min(1, 'Selecciona una carta.'),
  tcg: z.enum(['pokemon', 'onepiece']),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()])
    .transform((val) => {
      const str = String(val).trim().replace(',', '.');
      if (str === '') return undefined;
      const num = Number(str);
      return isNaN(num) ? undefined : num;
    })
    .pipe(
      z.number({
        message: 'Solo se aceptan números decimales.',
      }).min(0.01, 'El precio debe ser mayor que cero.')
    ),
  condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']),
  grading: z.object({
    company: z.enum(['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other']),
    grade: z.string().optional(),
    certificateNumber: z.string().optional(),
  }),
  status: z.enum(['active', 'reserved', 'sold', 'paused', 'expired']),
});

export const profileSchema = z.object({
  username: z.string().min(3, 'El username debe tener al menos 3 carácteres.'),
  bio: z.string().max(180, 'La biografía no puede superar 180 carácteres.').optional(),
});

export const collectionItemSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad mínima es 1.'),
  condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']),
  notes: z.string().max(180, 'Las notas no pueden superar 180 carácteres.').optional(),
  grading: z.object({
    company: z.enum(['raw', 'PSA', 'BGS', 'CGC', 'ACE', 'other']),
    grade: z.string().optional(),
    certificateNumber: z.string().optional(),
  }),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ListingForm = z.input<typeof listingSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type CollectionItemForm = z.infer<typeof collectionItemSchema>;
