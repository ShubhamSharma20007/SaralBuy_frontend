import { format as formatDate } from "date-fns";

export const dateFormatter = (date: Date, pattern: string = "dd-MM-yyyy") => {
  if(!date) return 'N/A'
  return formatDate(date, pattern);
};
