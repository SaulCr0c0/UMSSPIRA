import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

// Valida que la fecha no sea anterior a la fecha indicada en otra propiedad del mismo objeto
export function NoAnteriorA(propiedadInicio: string, opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) => {
    registerDecorator({
      name: 'noAnteriorA',
      target: objeto.constructor,
      propertyName: propiedad,
      constraints: [propiedadInicio],
      options: opciones,
      validator: {
        validate: (valor: unknown, args: ValidationArguments) => {
          const inicio = (args.object as Record<string, unknown>)[args.constraints[0]];
          if (typeof valor !== 'string' || typeof inicio !== 'string') return true;
          return new Date(valor) >= new Date(inicio);
        },
      },
    });
  };
}

// Valida que la fecha no sea posterior a hoy
export function FechaNoFutura(opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) => {
    registerDecorator({
      name: 'fechaNoFutura',
      target: objeto.constructor,
      propertyName: propiedad,
      options: opciones,
      validator: {
        validate: (valor: unknown) => typeof valor !== 'string' || new Date(valor) <= new Date(),
      },
    });
  };
}
