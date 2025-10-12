import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {useDebounce} from "use-debounce"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ListFilter, LoaderCircle, Search } from "lucide-react";
import { Button } from "./ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?:string;
  [key: string]: any;
}

export default function TableListing<TData, TValue>({
  columns,
  data,
  title,
  filters= true,
  colorPalette,
  target,
  page,
  setPage,
  total,
  limit,
  setSearch,
  search,
  isPending,

}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // const [globalFilter, setGlobalFilter] = useState("");

const totalPages = Math.ceil(total / limit);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      // globalFilter,
    },
    onSortingChange: setSorting,
    // onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-5">
      {/* 🔍 Search + Sort Buttons */}
     
     
         <div className={`flex ${title ? 'justify-between  gap-4' :"justify-end"} items-center`}>

       {
        title &&  <p className={`font-bold text-xl whitespace-nowrap   tracking-tight text-${colorPalette}-600  pl-3 tracking-tight`}>
          {title}
        </p>
       }
     {
      filters && (
          <div className="flex items-center gap-4">
         {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
            className=" px-3 py-2 focus-visible:ring-0 w-64 shadow-none border-1"
          />
          <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 " />
        </div>

        <Button
          variant={"secondary"}
          size={"icon"}
          className="cursor-pointer shadow-none bg-transparent border-1 "
          onClick={() =>
            setSorting([{ id: "your_budget", desc: false }]) 
          }
        >
          <ArrowUpNarrowWide className="w-4 h-4 text-gray-600" />
        </Button>

        <Button
          variant={"secondary"}
          size={"icon"}
          className="cursor-pointer shadow-none border-1 bg-transparent "
          onClick={() =>
            setSorting([{ id: "your_budget", desc: true }]) 
          }
        >
          <ArrowDownWideNarrow className="w-4 h-4 text-gray-600" />
        </Button>
       </div>
      )
     }
     {
      target === "requirementOverview" &&(
         <Button variant={'ghost'} size={'icon'} className=' w-24 flex gap-2 items-center justify-center text-sm font-medium  text-gray-700 bg-transparent border-1 hover:bg-transparent cursor-pointer border-gray-700'>
            Date
            <ListFilter className='w-5 h-5' />
          </Button>
      )
     }
      </div>
   
      <div className={`overflow-hidden max-h-[600px] rounded-md ${colorPalette ? `bg-${colorPalette}-50  rounded-lg` : ''}`} >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-200/60 ">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-600"  >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
{
 isPending && isPending() ? (
    <TableRow>
      <TableCell colSpan={columns.length}>
        <div className="flex justify-center items-center py-10 w-full">
          <LoaderCircle className="w-8 h-8 text-orange-700 animate-spin duration-100" />
        </div>
      </TableCell>
    </TableRow>
  ) : table.getRowModel().rows?.length ? (
    table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        No results.
      </TableCell>
    </TableRow>
  )
}

           
          </TableBody>
        </Table>
      </div>

{
  total > 10 &&<div className="flex items-center justify-between">
  <span className="text-sm text-gray-600">
    Page {page} of {totalPages}
  </span>
  <div className="flex gap-2">
    <Button
      className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
      onClick={() => setPage(page - 1)}
      disabled={page <= 1}
    >
      Previous
    </Button>
    <Button
      className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
      onClick={() => setPage(page + 1)}
      disabled={page >= totalPages}
    >
      Next
    </Button>
  </div>
</div>
}
     

    </div>
  );
}
