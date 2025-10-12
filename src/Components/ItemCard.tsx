

import { ChevronDown } from "lucide-react";
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ItemCard = ({
  categoryName,
  subCategories,
  image,
  _id,
}: {
  categoryName: string;
  subCategories: string[];
  image: string;
  _id: string;
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest(`#itemcard-${_id}`)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, _id]);

  return (
    <div className="group flex flex-col w-full relative" id={`itemcard-${_id}`}>
      {/* Card Trigger */}
      <div
        className="cursor-pointer rounded-2x w-full"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          className="w-full h-24 object-cover rounded-xs bg-blend-hard-light mix-blend-darken"
          src={image}
          alt="Category"
        />
        <div className="py-2 text-center flex justify-between items-center">
          <p className="text-sm pl-1 capitalize font-medium ">{categoryName === "beauty" ? 'Personal Care' : categoryName === "electronics" ? 'Electronics Appliances' : categoryName  === "sports" ? 'Sports & Stationary' : categoryName === 'home' ? 'Home Appliances' : categoryName  === 'industrial' ?"Industrial & Construction Material" : categoryName}</p>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown with scrollbar */}
      <div
        className={`
           left-0 top-full rounded-md z-30 w-[200px] bg-white border border-gray-200 mt-1
           origin-top
          ${open ? "max-h-56 opacity-100 scale-y-100 pointer-events-auto " : "max-h-0 opacity-0 scale-y-95 pointer-events-none"}
        `}
      >
        <div
          className="overflow-y-auto max-h-56 scroll-visible"
        >
          {subCategories.map((item: any, index) => (
            <div
              onClick={() => navigate(`/category/${_id}/${item._id}`)}
              key={index}
              className=" hover:bg-orange-100 dropdown-hover border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50  gap-2  px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ease-in-out hover:pl-5 cursor-pointer flex items-center justify-between border-b last:border-none"
            >
              <span>{item?.name || item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

