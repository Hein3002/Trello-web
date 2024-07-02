import Box from '@mui/material/Box'
import Columns from './Columns/Columns'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'

function ListColumns({ columns }) {

  return (
    <Box sx={{
      bgcolor: 'inherit',
      width: '100%',
      height: '100%',
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>

      {/* Box Column */}

      {columns?.map((column) => <Columns key={column._id} column={column} />)}

      {/* Box button add new columns */}
      <Box
        sx={{
          minWidth: '200px',
          maxWidth: '200px',
          backgroundColor: '#ffffff3d',
          height: 'fit-content',
          borderRadius: '4px',
          mx: 2
        }}
      >
        <Button
          startIcon={<NoteAddIcon />}
          sx={{
            color: 'white',
            width: '100%',
            justifyContent: 'flex-start',
            pl: 2.5,
            py: 1
          }}
        > Add new columns
        </Button>
      </Box>

    </Box>
  )
}

export default ListColumns
