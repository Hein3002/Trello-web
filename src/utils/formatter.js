/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

export const generatePlaceholderCard = (colum) => {
  return {
    _id: `${colum._id}-placeholder-card`,
    boardId: colum.boardId,
    columId: colum._id,
    FE_PlaceholderCard: true
  }
}
