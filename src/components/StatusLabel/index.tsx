import Typography from '@mui/material/Typography';
import { capitalizeFirstLetter } from '@/utils/common';

export enum StatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REQUESTED = 'REQUESTED',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  VALID = 'VALID',
  INVALID = 'INVALID',
  CANCELLED = 'CANCELLED',
}
// enum PayoutStatus
// {
//     PENDING = 0,
//     COMPLETED = 1,
//     REJECTED = 2,
//     CANCELLED = 3,
// }

// enum TransactionAction
// {
//     Approved = 0,
//     Rejected = 1
// }

//  enum TransactionStatus
//     {
//         PENDING = 0,
//         COMPLETED = 1,
//         FAILED = 2
//     }

interface StatusLabelProps {
  status: StatusEnum;
}

const statusColor = {
  [StatusEnum.PENDING]: '#E38800',
  [StatusEnum.APPROVED]: '#0066F4',
  [StatusEnum.COMPLETED]: '#0066F4',
  [StatusEnum.REQUESTED]: '#FF821C',
  [StatusEnum.SUCCESS]: '#2FB301',
  [StatusEnum.REJECTED]: '#F42B2B',
  [StatusEnum.FAILED]: '#F42B2B',
  [StatusEnum.VALID]: '#32373D',
  [StatusEnum.INVALID]: '#F42B2B',
  [StatusEnum.CANCELLED]: '#F42B2B',
} as {
  [key: string]: string;
};

const statusLabel = {
  completed: 'Approved',
  failed: 'Rejected',
  cancelled: 'Rejected',
} as {
  [key: string]: string;
};

const StatusLabel = (props: StatusLabelProps) => {
  const { status = StatusEnum.PENDING } = props;
  const label = statusLabel[status.toLocaleLowerCase()] || status;

  return (
    <Typography
      variant="body1"
      sx={{
        color: statusColor[status.toLocaleUpperCase()],
        textTransform: 'capitalize',
      }}
      className="status-label"
    >
      {capitalizeFirstLetter(label)}
    </Typography>
  );
};

export default StatusLabel;
