import Typography from '@mui/material/Typography';
import { capitalizeFirstLetter } from '@/utils/common';

export enum StatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REQUESTED = 'REQUESTED',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
  VALID = 'VALID',
  INVALID = 'INVALID',
}

interface StatusLabelProps {
  status: StatusEnum;
}

const statusColor = {
  [StatusEnum.PENDING]: '#E38800',
  [StatusEnum.APPROVED]: '#0066F4',
  [StatusEnum.REQUESTED]: '#FF821C',
  [StatusEnum.SUCCESS]: '#2FB301',
  [StatusEnum.REJECTED]: '#F42B2B',
  [StatusEnum.VALID]: '#32373D',
  [StatusEnum.INVALID]: '#F42B2B',
} as {
  [key: string]: string;
};

const StatusLabel = (props: StatusLabelProps) => {
  const { status = StatusEnum.PENDING } = props;

  return (
    <Typography
      variant="body1"
      sx={{
        color: statusColor[status.toLocaleUpperCase()],
        textTransform: 'capitalize',
      }}
      className="status-label"
    >
      {capitalizeFirstLetter(status)}
    </Typography>
  );
};

export default StatusLabel;
