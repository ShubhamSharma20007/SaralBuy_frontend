export const sortByDate = (arr: any[], sort: boolean, key = 'createdAt') => {
  return arr.sort((a, b) => { // chaning with original array
    const aDate = new Date(a[key]).getTime();
    const bDate = new Date(b[key]).getTime();

    return sort ? aDate - bDate : bDate - aDate;
  });
};
