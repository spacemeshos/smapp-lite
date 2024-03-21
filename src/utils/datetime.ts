export const formatDateAsISO = (date: Date) =>
  date.toISOString().replace(/:/g, '-');

export const getISODate = () => formatDateAsISO(new Date());
