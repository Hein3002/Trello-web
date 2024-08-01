import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'

import {
  DndContext,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
  // closestCenter
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import Columns from './ListColumns/Columns/Columns'
import Card from './ListColumns/Columns/ListCards/Card/Card'
import { generatePlaceholderCard } from '~/utils/formatter'

const ACTIVE_DARAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DARAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DARAG_ITEM_TYPE_CARD'
}
const BoardContent = ({
  board,
  createNewColumn,
  createNewCard,
  moveColumn,
  moveCardInTheSameColumn,
  moveCardToDefferentColumn,
  deleteColumnDetails
}) => {


  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  //Yeu cau chuot di chuyen 10px thi moi kich hoat event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  //Nhan giu khoang 250ms va dung sai (di chuyen/chenh lech 5px)
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //Su dung 2 loai de co trai nghiem tot tren mobile
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumnn] = useState([])

  const [activeDragItemId, setactiveDragItemId] = useState(null)
  const [activeDragItemType, setactiveDragItemType] = useState(null)
  const [activeDragItemData, setactiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setoldColumnWhenDraggingCard] = useState(null)

  //Diem va cham cuoi cung cua phan tu card duoc keo
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumnn(board.columns)
  }, [board])

  //tra ve cloumn theo cardId
  const findColumnByCardId = (carId) => {
    return orderedColumns.find(column => column.cards.map(card => card._id)?.includes(carId))
  }

  //Khoi tao fuc chung xu ly cap nhat lai columnId trong truong hop keo tha giua 2 column khac nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    activeColumn,
    overCardId,
    active,
    over,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumnn(prevColumn => {
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      const nextColumns = cloneDeep(prevColumn)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      if (nextActiveColumn) {
        //kiem tra card dang keo va xoa no khoi column hien tai
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //Them card placeholder neu column rong
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        //Cap nhat lai mang orderCardIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      if (nextOverColumn) {
        //kiem tra card dang keo co ton tai o overColumn chua neu co thi xoa no truoc
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //Xoa placeholderCard neu no ton tai trong column dinh keo card toi
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        //tiep theo them card dang keo vao overColumn theo vi tri moi
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          //Cap nhat lai columnId khi keo tha giua 2 column khac nhau
          { ...activeDraggingCardData, columnId: nextOverColumn._id })
        //Cap nhat lai mang orderCardIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      //neu fuc duoc goi tu handleDragEnd thi moi call api
      if (triggerFrom === 'handleDragEnd') {
        moveCardToDefferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }

      // console.log(nextColumns)
      return nextColumns
    })
  }

  //Khi bat dau keo
  const handleDragStart = (event) => {
    setactiveDragItemId(event?.active?.id)
    setactiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DARAG_ITEM_TYPE.CARD : ACTIVE_DARAG_ITEM_TYPE.COLUMN)
    setactiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setoldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  //Trong qua trinh keo
  const handleDragOver = (event) => {
    //Khong lam gi khi doi tuong duoc keo la column
    if (activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.COLUMN) {
      return
    }
    const { active, over } = event

    if (!over || !active) return

    //Card dang duoc keo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    //Card duoc tuong tac phia tren hoac duoi so voi card duoc keo
    const { id: overCardId } = over

    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        activeColumn,
        overCardId,
        active,
        over,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  //Ket thuc keo va thuc hien tha
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || !active) return

    //Khong lam gi khi doi tuong duoc keo la card
    if (activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.CARD) {
      //Card dang duoc keo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      //Card duoc tuong tac phia tren hoac duoi so voi card duoc keo
      const { id: overCardId } = over

      //Tim 2 column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      //Phai tao state moi la oldColumnWhenDraggingCard vi neu dung activeColumn se khong the chay vao if vi
      //active colum da bi setState trong handleDragOver
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        //keo tha card khac cloumn
        moveCardBetweenDifferentColumns(
          overColumn,
          activeColumn,
          overCardId,
          active,
          over,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )

      } else {
        //keo tha card trong cung cloumn
        // Vi tri cu tu acitve
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Vi tri moi tu over
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        //Tuong tu keo column trong boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        const dndCardOrderIds = dndOrderedCards.map(card => card._id)

        setOrderedColumnn(prevColumn => {
          const nextColumns = cloneDeep(prevColumn)

          // Tim toi column dang tha
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          //Cap nhat lai cards va cardOrderIds
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndCardOrderIds

          //Tra lai state moi chuan vi tri
          return nextColumns
        })

        moveCardInTheSameColumn(dndOrderedCards, dndCardOrderIds, oldColumnWhenDraggingCard._id)
      }

    }

    //Xu ly keo tha columns
    if (activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        // Vi tri cu tu acitve
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // Vi tri moi tu over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        //Dung arrayMove de sap xep lai columns ban dau
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        setOrderedColumnn(dndOrderedColumns)

        //goi fuc o component cha _id.jsx
        moveColumn(dndOrderedColumns)

      }
    }

    setactiveDragItemId(null)
    setactiveDragItemType(null)
    setactiveDragItemData(null)
  }

  const customdropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  //custom that toan va cham khi keo tha card giua nhieu column
  //args la cac tham so
  const collisionDetectionStrategy = useCallback((args) => {
    //truong hop keo column thi dung thuat toan mac dinh cua collisionDetection la closestCorners hoac closestCenter
    if (activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    //tim cac diem giao nhau voi con tro
    const pointerIntersections = pointerWithin(args)
    // console.log(pointerIntersections)
    if (!pointerIntersections?.length) return

    //thuat toan phat hien va cham tra ve cac mang va cham
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)
    // console.log(intersections)

    //tim overId dau tien trong mang va cham ben tren
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      //tim cot duoc keo den
      const checkColumn = orderedColumns.find(column => column._id === overId)
      // console.log(checkColumn)
      // console.log(closestCenter({ ...args }))
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => (
            container.id !== overId && (checkColumn?.cardOrderIds?.includes(container.id))
          ))
        })[0]?.id
        // console.log(overId)
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType, orderedColumns])


  return (

    <DndContext
      //cam bien phan biet con tro hay cham man hinh
      sensors={sensors}
      // collisionDetection={closestCorners}

      //Custom thuat toan phat hien va cham
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          deleteColumnDetails={deleteColumnDetails}
        />
        <DragOverlay dropAnimation={customdropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.COLUMN && <Columns column={activeDragItemData} />}
          {activeDragItemType === ACTIVE_DARAG_ITEM_TYPE.CARD && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext >
  )
}

export default BoardContent

