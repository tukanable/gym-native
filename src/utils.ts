import { parseISO, format } from 'date-fns';

export const groupByMomentDate = <T extends { moment: string }>(rows: ReadonlyArray<T>) => {
  const res: { [key: string]: T[] } = {};

  for (let row of rows) {
    const date = format(parseISO(row.moment), 'dd/LL');

    if (!res[date]) {
      res[date] = [];
    }

    res[date].push(row);
  }

  return res;
};
