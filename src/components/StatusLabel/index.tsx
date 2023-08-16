import Typography from '@mui/material/Typography';

export enum StatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REQUESTED = 'REQUESTED',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
  VALID = 'VALID',
  NOT_VALID = 'NOT_VALID',
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
  [StatusEnum.NOT_VALID]: '#F42B2B',
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
      }}
      className="status-label"
    >
      {status}
    </Typography>
  );
};

export default StatusLabel;
