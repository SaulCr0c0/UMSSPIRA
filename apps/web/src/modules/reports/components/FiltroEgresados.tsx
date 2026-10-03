import React, { useState, useMemo } from 'react';

export type EstadoEgresado = 'TODOS' | 'VERIFICADOS' | 'OBSERVADOS';

interface Egresado {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  estado: 'VERIFICADOS' | 'OBSERVADOS';
}

interface FiltroEgresadosProps {
  egresados: Egresado[];
  busquedaTexto: string;
}

export const FiltroEgresados: React.FC<FiltroEgresadosProps> = ({
  egresados,
  busquedaTexto,
}) => {
  // T3: Estado para la opción seleccionada del filtro
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoEgresado>('TODOS');

  // T4: Lógica para combinar búsqueda por texto y por estado simultáneamente
  const egresadosFiltrados = useMemo(() => {
    return egresados.filter((item) => {
      const coincideEstado =
        estadoSeleccionado === 'TODOS' || item.estado === estadoSeleccionado;

      const texto = busquedaTexto.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.apellido.toLowerCase().includes(texto) ||
        item.ci.includes(texto);

      return coincideEstado && coincideTexto;
    });
  }, [egresados, estadoSeleccionado, busquedaTexto]);

  return (
    <div className="w-full space-y-4">
      {/* T8: Layout responsivo para móvil y escritorio */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
        {/* T3: Selector de Estado */}
        <div className="w-full sm:w-auto flex flex-col">
          <label htmlFor="filtro-estado" className="text-sm font-medium text-gray-700 mb-1">
            Filtrar por estado:
          </label>
          <select
            id="filtro-estado"
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value as EstadoEgresado)}
            className="p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
          >
            <option value="TODOS">TODOS</option>
            <option value="VERIFICADOS">VERIFICADOS</option>
            <option value="OBSERVADOS">OBSERVADOS</option>
          </select>
        </div>
      </div>

      {/* T6: Mensaje cuando ningún egresado coincide con los filtros */}
      {egresadosFiltrados.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border rounded-lg bg-gray-50 mt-4">
          <p className="font-semibold text-base">No se encontraron egresados</p>
          <p className="text-sm text-gray-400">
            Intenta cambiar los términos de búsqueda o seleccionar otro estado.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {egresadosFiltrados.map((egresado) => (
              <li key={egresado.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{egresado.nombre} {egresado.apellido}</p>
                  <p className="text-sm text-gray-500">C.I.: {egresado.ci}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    egresado.estado === 'VERIFICADOS'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {egresado.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
