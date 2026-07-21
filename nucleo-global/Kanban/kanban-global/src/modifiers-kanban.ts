import type { Modifier } from '@dnd-kit/core'
import { getEventCoordinates } from '@dnd-kit/utilities'

/** Centraliza o overlay no cursor — evita sensação de card “flutuando longe” da mão. */
export const snapCenterToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !activatorEvent) return transform

  const coords = getEventCoordinates(activatorEvent)
  if (!coords) return transform

  const offsetX = coords.x - draggingNodeRect.left
  const offsetY = coords.y - draggingNodeRect.top

  return {
    ...transform,
    x: transform.x + offsetX - draggingNodeRect.width / 2,
    y: transform.y + offsetY - draggingNodeRect.height / 2,
  }
}
