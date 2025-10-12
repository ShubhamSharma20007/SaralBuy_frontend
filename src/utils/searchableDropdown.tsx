"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "../Components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../Components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Components/ui/popover"


type Props ={
    setValue:React.Dispatch<React.SetStateAction<string>>;
    value:string;
    className?:string;
    dropdownTitle:string;
    renderItems:{value:string,label:string}[];
    disbaled?:boolean
}
export function SearchableDropdown({setValue,className,value,dropdownTitle,renderItems,disbaled}:Props) {
  const [open, setOpen] = React.useState(false)
//   const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
        disabled={disbaled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[200px] justify-between ${className} text-gray-500 `}
        >
          {value
            ? renderItems.find((framework) => framework.value === value)?.label || dropdownTitle
            : dropdownTitle}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[200px] p-0 ${className}`}>
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty className="text-sm text-gray-600 p-2 text-center">No {dropdownTitle} found</CommandEmpty>
            <CommandGroup>
              {renderItems.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    setOpen(false)
                  }}
                >
                  {framework.label || (framework as any)?.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
