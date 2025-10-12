"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarDays, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "../Components/ui/button"
import { Calendar } from "../Components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Components/ui/popover"

type Props={
  date?: Date
  setDate?: React.Dispatch<React.SetStateAction<Date | undefined>>
  title?:string,
  className?:string
  disabledBeforeDate?:any
}
export function DatePicker({ date, setDate,title,className,disabledBeforeDate }: Props) {
  const [open, setOpen] = React.useState(false)


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={`data-[empty=true]:text-muted-foreground relative flex-1 justify-start text-left font-normal ${className}`}
        >
          <CalendarDays className="absolute right-2 top-2 h-4 w-4" />
          {date ? format(date, "dd-MM-yyyy") : <span>{title? title:'Select a date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single"  selected={date} 
        disabled={{before:disabledBeforeDate}}
        onSelect={(date)=>{
          setDate && setDate(date || undefined)
          setOpen(false)
        }} />
      </PopoverContent>
    </Popover>
  )
}