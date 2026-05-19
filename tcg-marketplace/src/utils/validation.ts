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
  title: z.string().min(4, 'El titulo debe ser mas descriptivo.'),
  description: z.string().min(12, 'Anade una descripcion util.'),
  price: z.number().min(1, 'El precio debe ser mayor que cero.'),
  condition: z.enum(['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ListingForm = z.infer<typeof listingSchema>;
