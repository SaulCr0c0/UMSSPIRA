import { ValidationOptions, registerDecorator } from 'class-validator';

// Valida que un año no sea mayor al año actual (se evalúa en cada petición, no al iniciar la app)
export function AnioNoFuturo(opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) => {
    registerDecorator({
      name: 'anioNoFuturo',
      target: objeto.constructor,
      propertyName: propiedad,
      options: opciones,
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'number' && valor <= new Date().getFullYear(),
      },
    });
  };
}
