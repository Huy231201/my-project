import { useEffect, useState, ChangeEvent, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import Modal, { DialogActions, DialogContent } from '@/components/Modal';
import { CancelButton, ConfirmButton } from '@/components/Buttons';
import { PlatformTypeOptions, ThreatEntryTypeOptions, ThreatTypeOptions } from '../config';
import ThreatManagementSelectField from '../threatManagementSelectField';

const MuiInputBase = styled(InputBase)({
  height: 40,
  maxWidth: 400,
  backgroundColor: 'white',
  borderRadius: 8,
  margin: '0px !important',
  padding: '12px',
  minWidth: 240,
  border: '1px solid #A1A9B5',
  '& .MuiInputBase-input': {
    padding: '4px',
  },
  '& svg': {
    width: 24,
    height: 24,
    cursor: 'pointer',
  },
  '&:hover': {
    borderColor: '#79a6ee',
    boxShadow: '0 0 0 2px rgba(63, 128, 230, 0.2)',
  },
});

interface FormInput {
  platformType: string;
  threatEntryType: string;
  threatType: string;
  data: string;
}

interface ModalProps {
  type: 'add' | 'detail' | 'edit' | 'delete' | null;
  title?: string;
  submitButtonText: 'Add' | 'Confirm' | 'Delete' | '';
  open: boolean;
  editData?: string;
  isLoading: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (formInput?: FormInput | undefined) => void;
}

function ThreatManagementModal({
  type,
  title,
  submitButtonText,
  open,
  editData,
  isLoading,
  onClose,
  onCancel,
  onConfirm,
}: ModalProps) {
  const [platformType, setPlatformType] = useState<string>('7');
  const [threatEntryType, setThreatEntryType] = useState<string>('1');
  const [threatType, setThreatType] = useState<string>('129');
  const [data, setData] = useState<string>('');

  const handlePlatformTypeChanged = (value: string) => {
    setPlatformType(value);
  };
  const handleThreatEntryTypeChanged = (value: string) => {
    setThreatEntryType(value);
  };
  const handleThreatTypeChanged = (value: string) => {
    setThreatType(value);
  };
  const handleUrlOrDomainChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setData(event.target.value);
  };

  const resetForm = () => {
    setPlatformType('7');
    setThreatEntryType('1');
    setThreatType('129');
    setData('');
  };

  const handleOnConfirm = () => {
    const formInput = { platformType, threatEntryType, threatType, data };
    if (type === 'add') {
      onConfirm(formInput);
      resetForm();
    }

    if (type === 'edit') {
      onConfirm(formInput);
    }

    if (type === 'delete') {
      onConfirm();
    }
  };

  const validationErrorMessage = useMemo(() => {
    switch (threatEntryType) {
      case '1': {
        const specialChars = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;
        if (data && !specialChars.test(data)) return 'Not a valid URL';
        break;
      }
      default:
        return '';
    }
    return '';
  }, [data, threatEntryType]);

  useEffect(() => {
    if (type !== 'edit') {
      resetForm();
    } else if (editData) {
      setData(editData);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">{window.T(title ?? '')}</Typography>
        </Stack>
      }
      onClose={onClose}
      sxWrapper={{
        '& .MuiDialog-paper': {
          width: '440px',
          margin: '16px',
          px: 2,
          py: 1,
        },
      }}
    >
      <DialogContent
        sx={{
          px: 4,
          py: 6,
          border: 'none',
        }}
        dividers
      >
        {(type === 'add' || type === 'edit') && (
          <>
            <Stack mb={3}>
              <ThreatManagementSelectField
                label="Platform Type"
                value={platformType}
                options={PlatformTypeOptions}
                onChange={handlePlatformTypeChanged}
                sx={{ width: '100%' }}
              />
            </Stack>
            <Stack mb={3}>
              <ThreatManagementSelectField
                label="Threat Entry Type"
                value={threatEntryType}
                options={ThreatEntryTypeOptions}
                onChange={handleThreatEntryTypeChanged}
                sx={{ width: '100%' }}
              />
            </Stack>
            <Stack mb={2}>
              <ThreatManagementSelectField
                label="Threat Type"
                value={threatType}
                options={ThreatTypeOptions}
                onChange={handleThreatTypeChanged}
                sx={{ width: '100%' }}
              />
            </Stack>
            <Stack mb={2}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: 14,
                }}
              >
                {window.T('Data')}
              </Typography>
              <MuiInputBase
                placeholder={window.T('Enter Data')}
                value={data}
                onChange={handleUrlOrDomainChanged}
                sx={{ width: '100%', height: 40 }}
              />
              <Typography variant="body1" color="error" marginTop="5px">{`${window.T(
                validationErrorMessage,
              )}`}</Typography>
            </Stack>
          </>
        )}
        {type === 'delete' && (
          <Typography variant="body1" color="error">
            {window.T('Do you want to remove this threat from the list?')}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <CancelButton
          type="submit"
          label={window.T('Cancel')}
          onClick={onCancel}
          sx={{
            minWidth: '120px !important',
          }}
        />
        {type === 'add' && (
          <ConfirmButton
            type="submit"
            disabled={!platformType || !threatEntryType || !threatType || !data || !!validationErrorMessage}
            label={window.T(submitButtonText)}
            onClick={handleOnConfirm}
            sx={{
              minWidth: '120px !important',
            }}
          />
        )}
        {type === 'edit' && (
          <ConfirmButton
            type="submit"
            disabled={!data || !!validationErrorMessage}
            label={window.T(submitButtonText)}
            loading={isLoading}
            onClick={handleOnConfirm}
            sx={{
              minWidth: '120px !important',
            }}
          />
        )}
        {type === 'delete' && (
          <ConfirmButton
            type="submit"
            label={window.T(submitButtonText)}
            loading={isLoading}
            onClick={handleOnConfirm}
            sx={{
              minWidth: '120px !important',
            }}
          />
        )}
      </DialogActions>
    </Modal>
  );
}
export default ThreatManagementModal;
