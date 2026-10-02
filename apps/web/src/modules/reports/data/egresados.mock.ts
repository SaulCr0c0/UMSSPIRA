export type EstadoEgresado = 'VERIFICADO' | 'OBSERVADO';

export interface Egresado {
  numeroRegistro: string;
  nombreCompleto: string;
  codigoSis: string;
  telefono: string;
  correo: string;
  fechaIngreso: string;
  fechaTitulacion: string;
  duracionEstudio: string;
  fechaRevision: string;
  motivoRechazo: string | null;
  estado: EstadoEgresado;
}

export const egresadosMock: Egresado[] = [
  { numeroRegistro: '#REG - 2024 - 0891', nombreCompleto: 'Morales Albarracín, Valeria Sofía', codigoSis: '201804921', telefono: '7951916', correo: 'valeria.morales@postgrado.uc.edu', fechaIngreso: '12/02/2018', fechaTitulacion: '24/10/2024', duracionEstudio: '5 años 6 meses', fechaRevision: '25/11/2026', motivoRechazo: null, estado: 'VERIFICADO' },
  { numeroRegistro: '#REG - 2024 - 0895', nombreCompleto: 'Quispe Condori, Marcelo Andrés', codigoSis: '201709122', telefono: '78156169', correo: 'marcelo.quispe@est.uc.edu', fechaIngreso: '05/03/2017', fechaTitulacion: '15/09/2024', duracionEstudio: '6 años 1 mes', fechaRevision: '18/11/2026', motivoRechazo: null, estado: 'OBSERVADO' },
  { numeroRegistro: '#REG - 2024 - 0902', nombreCompleto: 'Espinosa Toledo, Daniela Fernanda', codigoSis: '201901844', telefono: '72019483', correo: 'daniela.espinosa@alumni.uc.edu', fechaIngreso: '14/02/2019', fechaTitulacion: '05/11/2024', duracionEstudio: '5 años 2 meses', fechaRevision: '01/10/2026', motivoRechazo: null, estado: 'VERIFICADO' },
  { numeroRegistro: '#REG - 2024 - 0914', nombreCompleto: 'Salazar Justiniano, Diego Armando', codigoSis: '201805510', telefono: '76543210', correo: 'diego.salazar@est.uc.edu', fechaIngreso: '11/08/2018', fechaTitulacion: '02/10/2024', duracionEstudio: '5 años 8 meses', fechaRevision: '30/10/2025', motivoRechazo: null, estado: 'OBSERVADO' },
  { numeroRegistro: '#REG - 2024 - 0929', nombreCompleto: 'Villarroel Cadima, Camilo Ernesto', codigoSis: '201708301', telefono: '71192834', correo: 'camilo.villarroel@postgrado.uc.edu', fechaIngreso: '01/03/2017', fechaTitulacion: '28/08/2024', duracionEstudio: '6 años 4 meses', fechaRevision: '18/05/2025', motivoRechazo: null, estado: 'VERIFICADO' },
  { numeroRegistro: '#REG - 2024 - 0937', nombreCompleto: 'Arce Baldivieso, Luciana Belén', codigoSis: '201903490', telefono: '73384910', correo: 'luciana.arce@alumni.uc.edu', fechaIngreso: '15/02/2019', fechaTitulacion: '19/10/2024', duracionEstudio: '5 años 3 meses', fechaRevision: '02/03/2025', motivoRechazo: null, estado: 'VERIFICADO' },
  { numeroRegistro: '#REG - 2024 - 0945', nombreCompleto: 'Camacho Zeballos, Álvaro Mateo', codigoSis: '201802119', telefono: '74492018', correo: 'alvaro.camacho@est.uc.edu', fechaIngreso: '06/08/2018', fechaTitulacion: '11/11/2024', duracionEstudio: '5 años 7 meses', fechaRevision: '05/10/2024', motivoRechazo: null, estado: 'OBSERVADO' },
  { numeroRegistro: '#REG - 2024 - 0951', nombreCompleto: 'Paz Soldán, Mariana Elena', codigoSis: '201907723', telefono: '75583920', correo: 'mariana.paz@est.uc.edu', fechaIngreso: '10/02/2019', fechaTitulacion: '01/12/2024', duracionEstudio: '5 años 0 meses', fechaRevision: '08/05/2024', motivoRechazo: null, estado: 'OBSERVADO' },
  { numeroRegistro: '#REG - 2024 - 0968', nombreCompleto: 'Guzmán Terrazas, Rodrigo Ignacio', codigoSis: '201704612', telefono: '76619283', correo: 'rodrigo.guzman@postgrado.uc.edu', fechaIngreso: '02/03/2017', fechaTitulacion: '14/11/2024', duracionEstudio: '6 años 2 meses', fechaRevision: '12/03/2024', motivoRechazo: null, estado: 'VERIFICADO' },
  { numeroRegistro: '#REG - 2024 - 0972', nombreCompleto: 'Navarro Claure, Brenda Paulina', codigoSis: '201809003', telefono: '77728194', correo: 'brenda.navarro@alumni.uc.edu', fechaIngreso: '12/08/2018', fechaTitulacion: '20/10/2024', duracionEstudio: '5 años 5 meses', fechaRevision: '02/02/2024', motivoRechazo: null, estado: 'VERIFICADO' },
];