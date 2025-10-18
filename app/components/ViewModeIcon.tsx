import type {ViewMode} from '~/utils/collectionFilters';

type CellDef = {x: number; y: number; width: number; height: number};

const ICON_CELLS: Record<ViewMode, CellDef[]> = {
  large: [
    {x: 3, y: 4, width: 8, height: 5},
    {x: 3, y: 11, width: 8, height: 5},
    {x: 13, y: 4, width: 8, height: 5},
    {x: 13, y: 11, width: 8, height: 5},
  ],
  medium: [
    {x: 3, y: 4, width: 4.5, height: 4.5},
    {x: 3, y: 10.5, width: 4.5, height: 4.5},
    {x: 9.25, y: 4, width: 4.5, height: 4.5},
    {x: 9.25, y: 10.5, width: 4.5, height: 4.5},
    {x: 15.5, y: 4, width: 4.5, height: 4.5},
    {x: 15.5, y: 10.5, width: 4.5, height: 4.5},
  ],
  small: [
    {x: 2.5, y: 4.5, width: 3.2, height: 3.8},
    {x: 2.5, y: 10.2, width: 3.2, height: 3.8},
    {x: 2.5, y: 15.9, width: 3.2, height: 3.8},
    {x: 7.1, y: 4.5, width: 3.2, height: 3.8},
    {x: 7.1, y: 10.2, width: 3.2, height: 3.8},
    {x: 7.1, y: 15.9, width: 3.2, height: 3.8},
    {x: 11.7, y: 4.5, width: 3.2, height: 3.8},
    {x: 11.7, y: 10.2, width: 3.2, height: 3.8},
    {x: 11.7, y: 15.9, width: 3.2, height: 3.8},
    {x: 16.3, y: 4.5, width: 3.2, height: 3.8},
    {x: 16.3, y: 10.2, width: 3.2, height: 3.8},
    {x: 16.3, y: 15.9, width: 3.2, height: 3.8},
  ],
};

export default function ViewModeIcon({mode}: {mode: ViewMode}) {
  const cells = ICON_CELLS[mode];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {cells.map(({x, y, width, height}, index) => (
        <rect key={`${mode}-${index}`} x={x} y={y} width={width} height={height} rx={0.8} ry={0.8} />
      ))}
    </svg>
  );
}
