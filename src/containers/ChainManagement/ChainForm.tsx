import styled from '@emotion/styled';
import { Box, Button, FormControl, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import HerondIcon from '@/components/Icons';

export interface ChainProps {
  name: string;
  title?: string;
  chain: string;
  icon?: '';
  rpc: string | [];
  features: { name: string }[];
  faucets: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44: number;
  ens?: { registry: string };
  explorers: {
    name: string;
    url: string;
    icon?: string;
    standard: string;
  }[];
  status?: string;
}

interface ChainFormProps {
  handleSubmitForm: any;
  chainData?: ChainProps;
}

const ButtonAction = styled(Button)`
  border: none;
  color: #32373d;
  :hover {
    background-color: transparent;
    svg {
      color: red;
    }
  }
`;

const GroupArrayField = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin: 16px -8px 16px 8px;
  padding: 15px;

  .delete-btn {
  }
`;

function ChainForm({ handleSubmitForm, chainData }: ChainFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ChainProps>({
    mode: 'onBlur',
    defaultValues: {
      name: chainData?.name || '',
      title: chainData?.title || '',
      chain: chainData?.chain || '',
      rpc: chainData?.rpc || '',
      features: chainData?.features || [],
      faucets: chainData?.faucets || '',
      nativeCurrency: chainData?.nativeCurrency || {
        name: '',
        symbol: '',
        decimals: 0,
      },
      infoURL: chainData?.infoURL || '',
      shortName: chainData?.shortName || '',
      chainId: chainData?.chainId || 0,
      networkId: chainData?.networkId || 0,
      slip44: chainData?.slip44 || 0,
      ens: chainData?.ens || {
        registry: '',
      },
      explorers: chainData?.explorers || [],
    },
  });

  const {
    fields: featuresField,
    append: featuresAppend,
    remove: featuresRemove,
  } = useFieldArray({
    control,
    name: 'features',
  });

  const {
    fields: explorersField,
    append: explorersAppend,
    remove: explorersRemove,
  } = useFieldArray({
    control,
    name: 'explorers',
  });

  const onSubmit = async (data: any) => {
    Object.keys(data).forEach(key => {
      if (key === 'rpc' || key === 'faucets') {
        const dataArr = data[key].split('\n').filter((x: any) => x) || [];
        data[key] = dataArr;
      }
    });

    const res = await handleSubmitForm(data);
    if (res) {
      reset();
    }
  };

  return (
    <form action="" onSubmit={handleSubmit(data => onSubmit(data))}>
      <FormControl
        fullWidth
        sx={{
          '& .MuiTextField-root': { m: 1, minHeight: 50 },
          '.MuiFormHelperText-root': { fontSize: 10 },
        }}
      >
        <Controller
          name="name"
          control={control}
          rules={{ required: 'The field is required!' }}
          render={({ field }) => (
            <TextField
              error={!!errors.name}
              label="Name"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.name?.message}
            />
          )}
        />
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
            />
          )}
        />
        <Controller
          name="chain"
          control={control}
          rules={{ required: 'The field is required!' }}
          render={({ field }) => (
            <TextField
              error={!!errors.chain}
              label="Chain"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.chain?.message}
            />
          )}
        />

        <Controller
          name="rpc"
          control={control}
          render={({ field }) => (
            <TextField
              label="rpc"
              variant="outlined"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
            />
          )}
        />
        <GroupArrayField>
          <Stack direction="row" gap={5} alignItems="center">
            <Typography variant="h4" sx={{ color: '#5B636E', display: 'inline', ml: 0.5, paddingY: 1 }}>
              Features
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => featuresAppend({ name: '' })}
              sx={{ cursor: 'pointer', fontSize: 12 }}
            >
              Add
            </Button>
          </Stack>
          {featuresField.map((item, index) => (
            <Stack direction="row" alignItems="center" gap={10} key={item.id} ml={3}>
              <Controller
                render={({ field }) => (
                  <TextField
                    {...field}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span>Name: </span>
                        </InputAdornment>
                      ),
                    }}
                    variant="standard"
                  />
                )}
                name={`features.${index}.name`}
                control={control}
              />
              <ButtonAction variant="text" onClick={() => featuresRemove(index)}>
                <HerondIcon name="trash" />
              </ButtonAction>
            </Stack>
          ))}
        </GroupArrayField>
        <Controller
          name="faucets"
          control={control}
          render={({ field }) => (
            <TextField
              label="Faucets"
              variant="outlined"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
            />
          )}
        />
        <GroupArrayField>
          <Stack direction="row" gap={5} alignItems="center">
            <Typography variant="h4" sx={{ color: '#5B636E', display: 'inline', ml: 0.5, fontSiz: 30 }}>
              Native Currency
            </Typography>
          </Stack>
          <Stack direction="row">
            <Controller
              name="nativeCurrency.name"
              control={control}
              rules={{ required: 'The field is required!' }}
              render={({ field }) => (
                <TextField
                  error={!!errors.nativeCurrency?.name}
                  label="Name"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...field}
                  helperText={errors.nativeCurrency?.name?.message}
                />
              )}
            />
            <Controller
              name="nativeCurrency.symbol"
              control={control}
              rules={{ required: 'The field is required!' }}
              render={({ field }) => (
                <TextField
                  label="Symbol"
                  error={!!errors.nativeCurrency?.symbol}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...field}
                  helperText={errors.nativeCurrency?.name?.message}
                />
              )}
            />
            <Controller
              name="nativeCurrency.decimals"
              control={control}
              rules={{ required: 'The field is required!', min: { value: 1, message: 'The field is required!' } }}
              render={({ field }) => (
                <TextField
                  label="Decimals"
                  error={!!errors.nativeCurrency?.decimals}
                  variant="outlined"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...field}
                  helperText={errors.nativeCurrency?.name?.message}
                />
              )}
            />
          </Stack>
        </GroupArrayField>
        <Controller
          name="infoURL"
          control={control}
          rules={{ required: 'The field is required!' }}
          render={({ field }) => (
            <TextField
              label="Infor URL"
              error={!!errors.infoURL}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.infoURL?.message}
            />
          )}
        />
        <Controller
          name="shortName"
          control={control}
          rules={{ required: 'The field is required!' }}
          render={({ field }) => (
            <TextField
              label="Short Name"
              error={!!errors.shortName}
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.shortName?.message}
            />
          )}
        />
        <Controller
          name="chainId"
          control={control}
          rules={{ required: 'The field is required!', min: { value: 1, message: 'The field is required!' } }}
          render={({ field }) => (
            <TextField
              error={!!errors.chainId}
              label="chainId"
              variant="outlined"
              type="number"
              fullWidth
              disabled={!!chainData?.chainId}
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.chainId?.message}
            />
          )}
        />
        <Controller
          name="networkId"
          control={control}
          rules={{ required: 'The field is required!', min: { value: 1, message: 'The field is required!' } }}
          render={({ field }) => (
            <TextField
              label="networkId"
              error={!!errors.networkId}
              variant="outlined"
              type="number"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.networkId?.message}
            />
          )}
        />
        <Controller
          name="slip44"
          control={control}
          rules={{ required: 'The field is required!', min: { value: 1, message: 'The field is required!' } }}
          render={({ field }) => (
            <TextField
              label="Slip44"
              error={!!errors.slip44}
              variant="outlined"
              type="number"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              {...field}
              helperText={errors.slip44?.message}
            />
          )}
        />
        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              label="ENS"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span>Registry: </span>
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
          )}
          name="ens.registry"
          control={control}
        />
        <GroupArrayField>
          <Stack direction="row" gap={5} alignItems="center">
            <Typography variant="h4" sx={{ color: '#5B636E', display: 'inline', ml: 0.5, fontSiz: 30 }}>
              Explorers
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => explorersAppend({ name: '', url: '', standard: '' })}
              sx={{ cursor: 'pointer', fontSize: 12 }}
            >
              Add
            </Button>
          </Stack>
          {explorersField.map((item, index) => (
            <Stack direction="row" alignItems="center" key={item.id} ml={3}>
              <Controller
                render={({ field }) => (
                  <TextField
                    label="name"
                    {...field}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
                name={`explorers.${index}.name`}
                control={control}
              />
              <Controller
                render={({ field }) => (
                  <TextField
                    label="url"
                    {...field}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
                name={`explorers.${index}.url`}
                control={control}
              />
              <Controller
                render={({ field }) => (
                  <TextField
                    label="standard"
                    fullWidth
                    {...field}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
                name={`explorers.${index}.standard`}
                control={control}
              />
              <ButtonAction variant="text" onClick={() => explorersRemove(index)}>
                <HerondIcon name="trash" />
              </ButtonAction>
            </Stack>
          ))}
        </GroupArrayField>
        <Button type="submit" variant="outlined" fullWidth sx={{ ml: '8px' }}>
          {chainData ? 'Update' : 'Submit'}
        </Button>
      </FormControl>
    </form>
  );
}

export default ChainForm;
