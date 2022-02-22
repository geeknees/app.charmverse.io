import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import PrimaryButton from 'components/common/PrimaryButton';
import FieldLabel from 'components/settings/FieldLabel';
import Avatar from 'components/settings/LargeAvatar';
import Divider from '@mui/material/Divider';
import { useUser } from 'hooks/useUser';
import { Prisma, Space } from '@prisma/client';
import { ChangeEvent } from 'react';
import { DialogTitle } from 'components/common/Modal';
import { useForm } from 'react-hook-form';
import getDisplayName from 'lib/users/getDisplayName';
import { DOMAIN_BLACKLIST } from 'models/Space';
import charmClient from 'charmClient';

export const schema = yup.object({
  id: yup.string(),
  domain: yup.string().ensure().trim().lowercase()
    .min(3, 'Domain must be at least 3 characters')
    .matches(/^[0-9a-z-]*$/, 'Domain must be only lowercase hyphens, letters, and numbers')
    .notOneOf(DOMAIN_BLACKLIST, 'Domain is not allowed')
    .required('Domain is required')
    .test('domain-exists', 'Domain already exists', async function checkDomain (domain) {
      const { ok } = await charmClient.checkDomain({ domain, spaceId: this.parent.id });
      return !ok;
    }),
  name: yup.string().ensure().trim()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required')
});

export type FormValues = yup.InferType<typeof schema>;

interface Props {
  defaultValues?: { name: string, domain: string };
  onCancel?: () => void;
  onSubmit: (values: Prisma.SpaceCreateInput) => void;
  submitText?: string;
}

export default function WorkspaceSettings ({ defaultValues, onSubmit: _onSubmit, onCancel, submitText }: Props) {

  const [user] = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields }
  } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(schema)
  });

  const watchName = watch('name');
  const watchDomain = watch('domain');

  function onSubmit (values: FormValues) {
    try {
      _onSubmit({
        author: {
          connect: {
            id: user!.id
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user!.id,
        permissions: {
          create: [{
            role: 'admin',
            user: {
              connect: {
                id: user!.id
              }
            }
          }]
        },
        ...values
      });
    }
    catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }

  function onChangeName (event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;
    if (!touchedFields.domain) {
      setValue('domain', getDomainFromName(name));
    }

  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle onClose={onCancel}>Create a workspace</DialogTitle>
      <Divider />
      <br />
      <Grid container direction='column' spacing={3}>
        <Grid item display='flex' justifyContent='center'>
          <Avatar name={watchName} variant='rounded' />
        </Grid>
        <Grid item>
          <FieldLabel>Name</FieldLabel>
          <TextField
            {...register('name', {
              onChange: onChangeName
            })}
            autoFocus
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item>
          <FieldLabel>Domain</FieldLabel>
          <TextField
            {...register('domain')}
            fullWidth
            error={!!errors.domain}
            helperText={errors.domain?.message}
          />
        </Grid>
        <Grid item>
          <PrimaryButton disabled={!watchName || !watchDomain} type='submit'>
            {submitText || 'Create Workspace'}
          </PrimaryButton>
        </Grid>
      </Grid>
    </form>
  );

}

export function getDomainFromName (name: string) {
  return name.replace(/[\p{P}\p{S}]/gu, '').replace(/\s/g, '-').toLowerCase();
}