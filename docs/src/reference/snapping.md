# Selected time snapping

Whenever a time is selected, the value snaps to a round value. This applies to
clicking the timeline, hovering it, and dragging the rewind, day, or days
sliders. The snap rule depends on the current zoom level and applies the same
way across all interactions.

## Snap rules

| Zoom   | Snap target | Tolerance |
|--------|-------------|-----------|
| 10m    | minute      | 2 s       |
| 1h, 2h | minute      | 10 s      |
| 12h    | hour        | 5 min     |
| 1d     | hour        | 10 min    |

## Examples

The following demos show the snapping rule in action at different zoom levels.

<figure>
<img src="./snapping-files/snapping-1d.gif"/>
<figcaption aria-hidden="true">
Selecting a time near 12:00 at the <code>1d</code> zoom level.
</figcaption>
</figure>

<figure>
<img src="./snapping-files/snapping-1h.gif"/>
<figcaption aria-hidden="true">
Selecting a time near 12:01:00 at the <code>1h</code> zoom level.
</figcaption>
</figure>

<figure>
<img src="./snapping-files/snapping-10m.gif"/>
<figcaption aria-hidden="true">
Selecting a time near 12:01:02 at the <code>10m</code> zoom level.
</figcaption>
</figure>
