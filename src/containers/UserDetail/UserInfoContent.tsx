import React from 'react';
import Skeleton from '@mui/material/Skeleton';

interface Props {
  loading: boolean;
  content: string;
}

const UserInfoContent = (props: Props): JSX.Element => {
  const { loading, content } = props;
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        animation="wave"
        width={160}
        sx={{
          borderRadius: 0.5,
        }}
      />
    );
  }
  return <>{content}</>;
};

export default UserInfoContent;
