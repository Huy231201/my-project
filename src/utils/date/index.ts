import dayjs from 'dayjs';

export const formatDate = (date = '', format = 'MM/DD/YYYY HH:mm:ss') => (date ? dayjs(date).format(format) : '');
