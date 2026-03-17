/**
 * 12-column bento grid with first-fit packing.
 * Every size is a (colSpan, rowSpan) in 12-col units so the grid always packs with no gaps.
 */

const COLS = 12;

/** Size name → (colSpan, rowSpan) in 12-column grid. All divisors of 12 for clean alignment. */
const SIZE_TO_SPAN: Record<string, { colSpan: number; rowSpan: number }> = {
  small: { colSpan: 3, rowSpan: 1 },     // 1/4 width
  medium: { colSpan: 6, rowSpan: 1 },   // 1/2 width
  tall: { colSpan: 3, rowSpan: 2 },
  large: { colSpan: 6, rowSpan: 2 },
  wide3: { colSpan: 9, rowSpan: 1 },    // 3/4 width
  block3x2: { colSpan: 9, rowSpan: 2 },
  full: { colSpan: 12, rowSpan: 1 },
  tall3: { colSpan: 3, rowSpan: 3 },
};

const DEFAULT_SPAN = { colSpan: 6, rowSpan: 1 };

export type BentoPlacement = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

/**
 * Returns (colSpan, rowSpan) for a given size. Uses medium as fallback for unknown size.
 */
export function getSizeSpan(size: string): { colSpan: number; rowSpan: number } {
  return SIZE_TO_SPAN[size] ?? DEFAULT_SPAN;
}

/**
 * First-fit packer: places items in row-major order so the grid has no gaps.
 * Order of items does not matter for correctness; we scan (row, col) and place when the rectangle fits.
 */
export function packBentoGrid<T extends { id: string; size: string }>(
  items: T[]
): Map<string, BentoPlacement> {
  const placements = new Map<string, BentoPlacement>();
  // Occupied cells: row index → set of column indices that are taken in that row
  const occupied: Set<string> = new Set();

  function isFree(row: number, col: number, colSpan: number, rowSpan: number): boolean {
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (c >= COLS || occupied.has(`${r},${c}`)) return false;
      }
    }
    return true;
  }

  function mark(row: number, col: number, colSpan: number, rowSpan: number): void {
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        occupied.add(`${r},${c}`);
      }
    }
  }

  for (const item of items) {
    const { colSpan, rowSpan } = getSizeSpan(item.size);
    let placed = false;
    for (let row = 0; !placed; row++) {
      for (let col = 0; col <= COLS - colSpan; col++) {
        if (isFree(row, col, colSpan, rowSpan)) {
          mark(row, col, colSpan, rowSpan);
          placements.set(item.id, { col, row, colSpan, rowSpan });
          placed = true;
          break;
        }
      }
    }
  }

  return placements;
}
