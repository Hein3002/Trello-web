import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'

import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

const BoardContent = ({ board }) => {

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  //Yeu cau chuot di chuyen 10px thi moi kich hoat event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  
  //Nhan giu khoang 250ms va dung sai (di chuyen/chenh lech 5px)
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //Su dung 2 loai de co trai nghiem tot tren mobile
  const sensors = useSensors(mouseSensor, touchSensor)
  
  const [orderedColumns, setOrderedColumnn] = useState([])

  useEffect(() => {
    setOrderedColumnn(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      // Vi tri cu tu acitve
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      // Vi tri moi tu over
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      //Dung arrayMove de sap xep lai columns ban dau
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      //2 log de su ly goi api
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log(dndOrderedColumnsIds)
      // console.log(dndOrderedColumns)

      setOrderedColumnn(dndOrderedColumns)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />

      </Box>
    </DndContext>
  )
}

export default BoardContent

