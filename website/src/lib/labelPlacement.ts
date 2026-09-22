// Places each annotation label on a straight vertical line, packing labels
// into level rows that stack away from the group's bounding box. The line is
// at the label's anchor x, which is one of the annotation's left edge, center,
// or right edge. Runs per group and is shown only while that group is focused.
//
// Level packing uses the left-edge algorithm (track assignment), except it
// sorts by anchor x instead of the interval's left edge.

export type Bbox = [number, number, number, number]; // [x1, y1, x2, y2]

export interface AnnotationInput {
  id: number | string;
  label: string;
  group: string;
  bbox: Bbox;
}

export interface GroupInfo {
  id: string;
  bbox: Bbox;
  centerY: number;
}

export type Side = "top" | "bottom";

export interface LabelPlacement {
  id: number | string;
  label: string;
  group: string;
  anchorX: number;
  anchorY: number;
  side: Side;
  level: number;
  /** Top edge y of the group (levels are measured from here). */
  groupTopY: number;
  /** Bottom edge y of the group (levels are measured from here). */
  groupBottomY: number;
}

export interface LabelLayoutOptions {
  /** Vertical gap between levels. */
  levelGapY: number;
  /** Vertical gap from the group edge to the first level. */
  edgeGapY: number;
  /** Approximate character width, used to estimate the label's width. */
  charWidth: number;
  /** Horizontal padding around the label text. */
  labelPaddingX: number;
  /** Minimum horizontal gap between two labels on the same level. */
  labelGapX: number;
}

export const defaultLabelLayoutOptions: LabelLayoutOptions = {
  levelGapY: 40,
  edgeGapY: 30,
  charWidth: 8,
  labelPaddingX: 14,
  labelGapX: 20,
};

const estimateWidth = (text: string, opts: LabelLayoutOptions) =>
  text.length * opts.charWidth + opts.labelPaddingX;

const bboxCenterX = (b: Bbox) => (b[0] + b[2]) / 2;
const bboxCenterY = (b: Bbox) => (b[1] + b[3]) / 2;

/** Pick the anchor x from the bbox left edge, center, or right edge. Use the
 *  one farthest from the other annotations' centers in the same group, so
 *  nested annotations do not get the same anchor x. */
function chooseAnchorX(
  a: AnnotationInput,
  siblings: AnnotationInput[],
): number {
  const [x1, , x2] = a.bbox;
  const candidates = [x1, (x1 + x2) / 2, x2];
  const others = siblings
    .filter((o) => o.id !== a.id)
    .map((o) => bboxCenterX(o.bbox));

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const minDist = others.length
      ? Math.min(...others.map((ox) => Math.abs(ox - c)))
      : Infinity;
    if (minDist > bestScore) {
      bestScore = minDist;
      best = c;
    }
  }
  return best;
}

/** Label goes above or below, based on the group's vertical center. */
function sideFor(a: AnnotationInput, group: GroupInfo): Side {
  return bboxCenterY(a.bbox) <= group.centerY ? "top" : "bottom";
}

interface Interval {
  start: number;
  end: number;
}

/** A label with its anchor point and side resolved, before levels are packed. */
type AnchoredLabel = Omit<LabelPlacement, "level">;

/** Sort labels by anchor x, then give each label the first level where its
 *  horizontal span does not overlap a label already on that level. Labels
 *  whose spans do not touch can share a level.
 */
function packIntoLevels(
  items: AnchoredLabel[],
  opts: LabelLayoutOptions,
): LabelPlacement[] {
  const sorted = [...items].sort((a, b) => a.anchorX - b.anchorX);
  const levels: Interval[][] = [];

  return sorted.map((item) => {
    const width = estimateWidth(item.label, opts);
    const interval: Interval = {
      start: item.anchorX - width / 2 - opts.labelGapX / 2,
      end: item.anchorX + width / 2 + opts.labelGapX / 2,
    };
    let level = 0;
    while (
      (levels[level] ?? []).some(
        (r) => interval.start < r.end && interval.end > r.start,
      )
    ) {
      level++;
    }
    (levels[level] ??= []).push(interval);
    return { ...item, level };
  });
}

/** For one group: set each annotation's anchor and side, then pack the top
 *  labels and the bottom labels into levels. */
export function layoutLabels(
  annotations: AnnotationInput[],
  group: GroupInfo,
  options: Partial<LabelLayoutOptions> = {},
): LabelPlacement[] {
  const opts: LabelLayoutOptions = { ...defaultLabelLayoutOptions, ...options };
  const inGroup = annotations.filter((a) => a.group === group.id);

  const withAnchors: AnchoredLabel[] = inGroup.map((a) => {
    const side = sideFor(a, group);
    return {
      id: a.id,
      label: a.label,
      group: a.group,
      anchorX: chooseAnchorX(a, inGroup),
      anchorY: side === "top" ? a.bbox[1] : a.bbox[3],
      side,
      groupTopY: group.bbox[1],
      groupBottomY: group.bbox[3],
    };
  });

  return [
    ...packIntoLevels(
      withAnchors.filter((a) => a.side === "top"),
      opts,
    ),
    ...packIntoLevels(
      withAnchors.filter((a) => a.side === "bottom"),
      opts,
    ),
  ];
}

export function labelY(
  item: LabelPlacement,
  options: Partial<LabelLayoutOptions> = {},
): number {
  const opts: LabelLayoutOptions = { ...defaultLabelLayoutOptions, ...options };
  const offset = opts.edgeGapY + item.level * opts.levelGapY;
  return item.side === "top"
    ? item.groupTopY - offset
    : item.groupBottomY + offset;
}
