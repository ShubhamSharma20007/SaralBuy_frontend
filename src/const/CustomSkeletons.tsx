
import { Card, CardContent } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/Components/ui/table";



export  function SkeletonTable() {
  return (
    <div className="border-gray-100 border rounded-lg">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-3 w-[100px]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[100px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

//  this is  for UpdateBidOverView
export  function CategoryFormSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">

      <div className="w-full md:w-1/3 border-gray-100 border rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>

      <div className="w-full md:w-2/3 space-y-6">
        {/* Product Details */}
        <div className="border-gray-100 border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        <div className="border-gray-100 border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <div className="flex gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>


        <div className="border-gray-100 border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}



export  function SliderSkeleton() {
  return (

      <Card className="shadow-none border border-gray-200 mb-2 p-4">
        <CardContent className="px-3">
          <div className="flex items-center justify-between gap-6">
            {/* left block: image + meta */}
            <div className="flex items-center gap-4">
              {/* image / illustration */}
              <Skeleton className="w-20 h-20 rounded-md" />

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {/* category badge (skeleton) and name */}
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-28 h-6 rounded-md" />
                </div>

                {/* title/name */}
                <div className="mt-2">
                  <Skeleton className="w-40 h-6 rounded-md" />
                </div>

                {/* two lines: Delivery By / QTY */}
                <div className="mt-3 flex gap-6">
                  <div className="flex flex-col">
                    <Skeleton className="w-28 h-5 rounded-md" />
                    <Skeleton className="w-16 h-5 rounded-md mt-1" />
                  </div>

                  <div className="flex flex-col">
                    <Skeleton className="w-24 h-5 rounded-md" />
                    <Skeleton className="w-16 h-5 rounded-md mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* right block: date + button */}
            <div className="flex flex-col items-end justify-between h-full">
              <div className="mb-2">
                <Skeleton className="w-28 h-5 rounded-md" />
              </div>

              <div className="flex flex-col items-end gap-3">
                <Skeleton className="w-36 h-10 rounded-md" />
              
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}


export  function ProductListingCardSkeleton() {
  return (
    <Card className="shadow-none border border-gray-200 mb-2 p-4">
      {/* Category Badge */}
      <div className="w-24 h-6">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="flex gap-4">
        {/* Product Image */}
        <Skeleton className="w-20 h-20 rounded-lg" />

        {/* Right Content */}
        <div className="flex flex-col gap-2 flex-1">
          {/* Title */}
          <Skeleton className="h-5 w-32" />

          {/* User */}
          <Skeleton className="h-4 w-40" />

          {/* Location */}
          <Skeleton className="h-4 w-28" />

          {/* Quantity */}
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        {/* Date */}
        <Skeleton className="h-4 w-28" />

        {/* Button */}
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </Card>
  )
}
