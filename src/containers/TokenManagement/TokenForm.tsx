import styled from '@emotion/styled';
import { FormControl, MenuItem, TextField, Typography } from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

export interface inputDataProps {
  address: string;
  name: string;
  erc20: boolean;
  symbol: string;
  decimals: string;
  coingeckoId: string;
  chainId: string;
  logo?: string;
}
interface TokenFormProps {
  tokenInfo: inputDataProps;
  setTokenInfo: Dispatch<SetStateAction<inputDataProps>>;
  file: any;
  setFile: Dispatch<SetStateAction<any>>;
  detail?: boolean;
}

const InputFile = styled(FormControl)`
  label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 8px 16px;
    border: 1px solid #545454;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
    :hover {
      color: #fff;
      background-color: #74a0e5;
      border: 1px solid #fff;
    }
  }

  img {
    width: 50px;
    height: 50px;
  }

  .review {
    display: flex;
    align-items: center;
    gap: 20px;
  }
`;

function TokenForm({ tokenInfo, setTokenInfo, file, setFile, detail }: TokenFormProps) {
  const [fileError, setFileError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target) {
      const name = e.target?.name;
      const value = e.target?.value;

      setTokenInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSetFile = (e: any) => {
    if (e.target && 'files' in e.target) {
      const newFile = e.target.files?.[0];

      const isPNG = /\.png$/i.test(newFile.name);
      // const isJPG = /\.jpe?g$/i.test(newFile.name);
      const isCorrectFileSize = newFile.size < 20000;

      const timeStamp = new Date().getTime().toString();
      const modifiedNewFile = new File([newFile], newFile.name.replace(/\.png$/, `_${timeStamp}.png`), {
        type: newFile.type,
      });

      if (!isPNG || !isCorrectFileSize) {
        e.target = '';
        setFile(null);
        setFileError('Logo must be .png and less than 20kB');
        return;
      }
      setFile(modifiedNewFile);
      setFileError('');
    }
  };

  return (
    <FormControl
      fullWidth
      sx={{
        '& .MuiTextField-root': { m: 1, minHeight: 50 },
      }}
    >
      <TextField
        label="Address"
        variant="outlined"
        name="address"
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        onChange={e => handleChange(e)}
        value={tokenInfo.address}
        disabled={detail}
      />
      <TextField
        label="Name"
        variant="outlined"
        name="name"
        value={tokenInfo.name}
        onChange={e => handleChange(e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        value={tokenInfo.erc20}
        label="erc20"
        name="erc20"
        onChange={e => handleChange(e)}
        select
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      >
        <MenuItem value={true as any}>Yes</MenuItem>
        <MenuItem value={false as any}>No</MenuItem>
      </TextField>

      <TextField
        label="Symbol"
        variant="outlined"
        fullWidth
        value={tokenInfo.symbol}
        onChange={e => handleChange(e)}
        name="symbol"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="Decimals"
        variant="outlined"
        type="number"
        fullWidth
        value={tokenInfo.decimals}
        onChange={e => handleChange(e)}
        name="decimals"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="CoingeckoId"
        variant="outlined"
        fullWidth
        value={tokenInfo.coingeckoId}
        onChange={e => handleChange(e)}
        name="coingeckoId"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label="ChainId"
        variant="outlined"
        fullWidth
        value={tokenInfo.chainId}
        onChange={e => handleChange(e)}
        name="chainId"
        InputLabelProps={{
          shrink: true,
        }}
        disabled={detail}
      />
      <InputFile
        sx={{
          ml: '8px',
        }}
      >
        {file || tokenInfo?.logo ? (
          <div className="review">
            <img src={file ? URL.createObjectURL(file) : tokenInfo?.logo} alt="" />
            <div style={{ marginTop: 10 }}>
              <label htmlFor="token-logo">Change Logo</label>

              <input
                type="file"
                onChange={e => handleSetFile(e)}
                id="token-logo"
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
              />
              <Typography color="error" sx={{ display: 'inline', fontSize: 14, mt: '2px' }}>
                {fileError}
              </Typography>
            </div>
          </div>
        ) : (
          <>
            <label htmlFor="token-logo">Upload Logo</label>

            <input
              type="file"
              onChange={e => handleSetFile(e)}
              id="token-logo"
              accept="image/jpeg, image/png"
              style={{ display: 'none' }}
            />
            <Typography color="error" sx={{ display: 'inline', fontSize: 14, mt: '2px' }}>
              {fileError}
            </Typography>
          </>
        )}
      </InputFile>
    </FormControl>
  );
}

export default TokenForm;
