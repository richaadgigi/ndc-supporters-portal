'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Email } from '@carbon/icons-react';
import authService from '../../services/auth.service';
import { showAlert } from '../common';
import { extractErrorMessage } from '../../utils/formatters';

interface UpdateEmailProps {
  currentEmail: string;
  onSuccess: () => void;
  setError: (message: string) => void;
  setSuccessMessage: (message: string) => void;
}

interface EmailFormData {
  email: string;
}

const friendlyError = (message: string) =>
  /validation error|unique|already exists/i.test(message) ? 'That email is already used by another account' : message;

const UpdateEmail = ({ currentEmail, onSuccess, setError, setSuccessMessage }: UpdateEmailProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<EmailFormData>({
    defaultValues: { email: currentEmail },
  });

  useEffect(() => {
    reset({ email: currentEmail });
  }, [currentEmail, reset]);

  const emailValue = watch('email');
  const unchanged = (emailValue || '').trim().toLowerCase() === (currentEmail || '').trim().toLowerCase();

  const onSubmit = async (data: EmailFormData) => {
    setSaving(true);
    try {
      const response = await authService.updateEmail({ email: data.email.trim().toLowerCase() });
      if (response.success) {
        setSuccessMessage(currentEmail ? 'Email updated successfully' : 'Email added successfully');
        showAlert('success-alert');
        onSuccess();
      } else {
        setError(friendlyError(response.message || 'Failed to update email'));
        showAlert('error-alert');
      }
    } catch (err: any) {
      setError(friendlyError(extractErrorMessage(err, 'Failed to update email')));
      showAlert('error-alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="xui-bg-white xui-bdr-rad-[8px] xui-p-1-half" style={{ border: '1px solid var(--neutral-200)' }}>
      <div className="xui-d-flex xui-flex-ai-center xui-grid-gap-half xui-pb-1" style={{ borderBottom: '1px solid var(--neutral-100)' }}>
        <Email size={18} style={{ color: 'var(--neutral-600)' }} />
        <h3 className="xui-font-sz-[16px] xui-font-w-600" style={{ color: 'var(--neutral-900)', margin: 0 }}>
          {currentEmail ? 'Email Address' : 'Add Email Address'}
        </h3>
      </div>

      {!currentEmail && (
        <p className="xui-font-sz-85 xui-opacity-6 xui-mt-1" style={{ margin: '12px 0 0' }}>
          Add an email so you can receive login codes and reset your password.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="xui-form xui-mt-1">
        <div className="xui-form-box" {...(errors.email && { 'xui-error': 'true' })}>
          <label htmlFor="profile_email">Email</label>
          <input
            type="email"
            id="profile_email"
            placeholder="Enter your email address"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
            })}
          />
          {errors.email && <span className="message">{errors.email.message}</span>}
        </div>

        <button
          type="submit"
          disabled={saving || unchanged}
          className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[14px]"
          style={{ backgroundColor: 'var(--primary-600)', color: '#fff', opacity: saving || unchanged ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : currentEmail ? 'Update Email' : 'Add Email'}
        </button>
      </form>
    </div>
  );
};

export default UpdateEmail;
