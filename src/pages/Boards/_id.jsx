import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI } from '~/apis'
import { mockData } from './../../apis/mock-data';

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '6697dea7e69d58649ee06416'
    //Call Api
    fetchBoardDetailsAPI(boardId).then(board => {
      setBoard(board)
    })
  }, [])

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar/>
      <BoardBar board={mockData.board}/>
      <BoardContent board={mockData.board}/>
    </Container>
  )
}

export default Board

