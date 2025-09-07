import { type PrimitiveAtom, useAtom } from 'jotai'


type PaginationProps = {
  totalRows: number
  filtersAtom: PrimitiveAtom<GetScannerResultParams>
}

const Pagination: React.FC<PaginationProps> = ({ filtersAtom, totalRows }) => {
  const [ filters, setFilters ] = useAtom(filtersAtom)

  const { page } = filters
  const pages = Math.ceil(totalRows / 100)

  const handleNextPageClick = () => {
    setFilters(prev => ({
      ...prev,
      page: prev.page! + 1,
    }))
  }

  const handlePrevPageClick = () => {
    setFilters(prev => ({
      ...prev,
      page: prev.page! - 1,
    }))
  }

  return (
    <div className="flex items-center w-fit mx-auto space-x-2 mt-3">
      {
        page! > 1 && (
          <button className="button" onClick={handlePrevPageClick}>Back</button>
        )
      }
      <div className="">Showing { (page! - 1) * 100 + 1 } to { page! * 100 } of {totalRows}</div>
      {
        page! < pages && (
          <button className="button" onClick={handleNextPageClick}>Next</button>
        )
      }
    </div>
  )
}

export default Pagination
