'use client';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Información de registros */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="text-base">☷</span>

        <span>
          Mostrando {startItem}-{endItem} de {totalItems} registros
        </span>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Anterior */}
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="
            rounded-lg
            border
            border-slate-300
            bg-transparent
            px-4
            py-2.5
            text-xs
            font-bold
            text-slate-700
            transition
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ANTERIOR
        </button>

        {/* Números de página */}
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              border
              text-sm
              font-medium
              transition
              ${
                currentPage === page
                  ? 'border-[#1e293b] bg-[#1e293b] text-white'
                  : 'border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            {page}
          </button>
        ))}

        {/* Siguiente */}
        <button
          type="button"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="
            rounded-lg
            border
            border-slate-300
            bg-transparent
            px-4
            py-2.5
            text-xs
            font-bold
            text-slate-700
            transition
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  );
}