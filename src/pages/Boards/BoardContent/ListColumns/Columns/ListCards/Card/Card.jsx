
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Card as CardMui } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'


function Card({ card }) {

  const souldShowCardAction = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  return (
    <CardMui sx={{
      cursor: 'pointer',
      boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
      overflow: 'unset'
    }}>
      {card?.cover &&
        <CardMedia sx={{ height: 140 }} image={card?.cover} title="green iguana" />
      }

      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography>{card?.title}</Typography>
      </CardContent>
      {souldShowCardAction() &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length && <Button startIcon={<GroupIcon />} size="small">{card.memberIds.length}</Button>}
          {!!card?.comments?.length && <Button startIcon={<CommentIcon />} size="small">{card.memberIds.length}</Button>}
          {!!card?.attachments?.length && <Button startIcon={<AttachmentIcon />} size="small">{card.memberIds.length}</Button>}
        </CardActions>
      }
    </CardMui>
  )
}

export default Card
