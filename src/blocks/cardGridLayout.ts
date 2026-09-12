const MIN_CARD_WIDTH = 140;

export function cardGridItemWidth(
  gridWidth: number,
  gap: number,
): {columns: 1 | 2; cardWidth: number} {
  if (gridWidth <= 0) {
    return {columns: 1, cardWidth: 0};
  }

  const twoColumnWidth = Math.floor((gridWidth - gap) / 2);
  if (twoColumnWidth >= MIN_CARD_WIDTH) {
    return {columns: 2, cardWidth: twoColumnWidth};
  }

  return {columns: 1, cardWidth: gridWidth};
}

export function chunkRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  const size = Math.max(columns, 1);

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}
