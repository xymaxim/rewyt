export function ellipsePositions({
  n,
  cx,
  cy,
  rx,
  ry,
  nudges,
  angle,
}: PositionParams) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((2 * Math.PI) / n) * i - Math.PI + angle;
    return {
      x: cx + (rx + nudges[i]) * Math.cos(a),
      y: cy + (ry + nudges[i]) * Math.sin(a),
    };
  });
}

export function ellipseSkippedPositions({
  n,
  cx,
  cy,
  rx,
  ry,
  nudges,
  angle,
  skipCount = 2,
}: PositionParams & { skipCount?: number }) {
  const totalCount = n + skipCount;

  const fullNudges = [...nudges, ...Array(skipCount).fill(0)];

  // Pick skip indices ensuring at least 2 positions between them
  const skipIndices = new Set<number>();
  while (skipIndices.size < skipCount) {
    const candidate = Math.floor(Math.random() * totalCount);

    // Check if candidate is at least 2 away from all existing skip indices
    let isValid = true;
    for (const existing of skipIndices) {
      if (Math.abs(candidate - existing) < 2) {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      skipIndices.add(candidate);
    }
  }

  const positions = Array.from({ length: totalCount }, (_, i) => {
    if (skipIndices.has(i)) return null;

    const a = ((2 * Math.PI) / totalCount) * i - Math.PI + angle;
    return {
      x: cx + (rx + 0) * Math.cos(a),
      y: cy + (ry + 0) * Math.sin(a),
    };
  }).filter((pos) => pos !== null);

  return positions;
}

export function ellipseSkippedPositions2({
  n,
  cx,
  cy,
  rx,
  ry,
  nudges,
  angle,
  skipCount = 2,
}: PositionParams & { skipCount?: number }) {
  const totalCount = n + skipCount;

  const totalNudges = [...nudges, ...Array(skipCount).fill(0)];

  let positions = Array.from({ length: totalCount }, (_, i) => {
    const a = ((2 * Math.PI) / totalCount) * i - Math.PI + angle;
    return {
      x: cx + (rx + totalNudges[i]) * Math.cos(a),
      y: cy + (ry + totalNudges[i]) * Math.sin(a),
    };
  });
  for (let i = 0; i < skipCount; i++) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    positions.splice(randomIndex, 1);
  }
  return positions;
}

export function randomPositions({ n, cx, cy, rx, ry, radii }: PositionParams) {
  const placed: { x: number; y: number; r: number }[] = [];
  const maxAttempts = 100;

  return Array.from({ length: n }, (_, i) => {
    const r = radii?.[i] ?? 0;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = cx + (Math.random() - 0.5) * rx * 2;
      const y = cy + (Math.random() - 0.5) * ry * 2;
      const overlaps = placed.some(
        (p) => Math.hypot(p.x - x, p.y - y) < p.r + r,
      );
      if (!overlaps) {
        placed.push({ x, y, r });
        return { x, y };
      }
    }
    const x = cx + (Math.random() - 0.5) * rx * 2;
    const y = cy + (Math.random() - 0.5) * ry * 2;
    placed.push({ x, y, r });
    return { x, y };
  });
}

export function tanPositions({
  n,
  cx,
  cy,
  rx,
  ry,
  nudges,
  angle,
  maxTan = 2.5,
}: PositionParams & { maxTan?: number }) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((2 * Math.PI) / n) * i - Math.PI + angle;
    return {
      x:
        cx +
        (rx + nudges[i]) * Math.max(-maxTan, Math.min(maxTan, Math.tan(a))),
      y: cy + (ry + nudges[i]) * Math.sin(a),
    };
  });
}
