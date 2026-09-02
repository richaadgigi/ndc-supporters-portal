'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { View, ViewOff } from '@carbon/icons-react';
import { APP_NAME } from '../../Globals';
import authService from '../../services/auth.service';
import { Alert, showAlert, PhoneNumberInput, DateOfBirthSelect } from '../../components/common';
import { extractErrorMessage } from '../../utils/formatters';

interface SignupFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  nin: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SignupFormData>({
    defaultValues: {
      firstname: '', middlename: '', lastname: '', email: '', phone_number: '',
      gender: '', date_of_birth: '', nin: '', password: '', confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await authService.portalSignup({
        firstname: data.firstname.trim(),
        ...(data.middlename.trim() && { middlename: data.middlename.trim() }),
        lastname: data.lastname.trim(),
        email: data.email.trim(),
        ...(data.phone_number && { phone_number: data.phone_number }),
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        ...(data.nin.trim() && { nin: data.nin.trim() }),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage('Account created successfully. You can now sign in.');
        showAlert('success-alert');
        setTimeout(() => router.push('/login'), 1800);
      } else {
        setErrorMessage(response.message || 'Failed to create account');
        showAlert('error-alert');
      }
    } catch (err: any) {
      setErrorMessage(extractErrorMessage(err, 'Failed to create account'));
      showAlert('error-alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="xui-max-w-[440px] xui-w-fluid-100 xui-mx-auto">
      <img src="/tdm-logo.jpeg" alt="TDM" style={{ width: '80px', height: 'auto' }} />

      <div className="xui-mt-2 xui-md-mt-4">
        <h1 className="xui-font-sz-[28px]">Create Account</h1>
        <p className="xui-font-sz-[14px] xui-mt-1 xui-mb-1-half">
          <span className="xui-opacity-4">Join {APP_NAME} as a member</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="xui-form">
          <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
            <div className="xui-form-box" {...(errors.firstname && { 'xui-error': 'true' })}>
              <label htmlFor="firstname">First Name *</label>
              <input type="text" id="firstname" placeholder="Enter first name"
                {...register('firstname', { required: 'First name is required', maxLength: { value: 50, message: 'Maximum 50 characters' } })} />
              {errors.firstname && <span className="message">{errors.firstname.message}</span>}
            </div>

            <div className="xui-form-box" {...(errors.lastname && { 'xui-error': 'true' })}>
              <label htmlFor="lastname">Last Name *</label>
              <input type="text" id="lastname" placeholder="Enter last name"
                {...register('lastname', { required: 'Last name is required', maxLength: { value: 50, message: 'Maximum 50 characters' } })} />
              {errors.lastname && <span className="message">{errors.lastname.message}</span>}
            </div>
          </div>

          <div className="xui-form-box">
            <label htmlFor="middlename">Middle Name</label>
            <input type="text" id="middlename" placeholder="Enter middle name"
              {...register('middlename', { maxLength: { value: 50, message: 'Maximum 50 characters' } })} />
          </div>

          <div className="xui-form-box" {...(errors.email && { 'xui-error': 'true' })}>
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" placeholder="Enter email address"
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } })} />
            {errors.email && <span className="message">{errors.email.message}</span>}
          </div>

          <PhoneNumberInput control={control} name="phone_number" label="Phone Number" id="phone_number" />

          <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
            <div className="xui-form-box" {...(errors.gender && { 'xui-error': 'true' })}>
              <label htmlFor="gender">Gender *</label>
              <select id="gender" {...register('gender', { required: 'Gender is required' })}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="message">{errors.gender.message}</span>}
            </div>

            <div className="xui-form-box">
              <label htmlFor="nin">NIN</label>
              <input type="text" id="nin" placeholder="11 digit NIN" inputMode="numeric" maxLength={11}
                {...register('nin', { pattern: { value: /^\d{10,11}$/, message: 'NIN must be 11 digits' } })} />
              {errors.nin && <span className="message">{errors.nin.message}</span>}
            </div>
          </div>

          <DateOfBirthSelect label="Date of Birth" required value={watch('date_of_birth') || ''}
            onChange={(val) => setValue('date_of_birth', val, { shouldValidate: true })} />
          <input type="hidden" {...register('date_of_birth', { required: 'Date of birth is required' })} />
          {errors.date_of_birth && <span className="message" style={{ color: 'var(--error)' }}>{errors.date_of_birth.message}</span>}

          <div className="xui-form-box" {...(errors.password && { 'xui-error': 'true' })}>
            <label htmlFor="password">Password *</label>
            <div className="xui-pos-relative">
              <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Enter password" style={{ paddingRight: '40px' }}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  maxLength: { value: 50, message: 'Maximum 50 characters' },
                  validate: (value) =>
                    (/[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value))
                    || 'Must include an uppercase, lowercase, number and special character',
                })} />
              <button type="button"
                className="xui-pos-absolute xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-cursor-pointer"
                style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--neutral-400)' }}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <ViewOff size={20} /> : <View size={20} />}
              </button>
            </div>
            {errors.password && <span className="message">{errors.password.message}</span>}
          </div>

          <div className="xui-form-box" {...(errors.confirmPassword && { 'xui-error': 'true' })}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="xui-pos-relative">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" placeholder="Re-enter password" style={{ paddingRight: '40px' }}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === passwordValue || 'Passwords are different',
                })} />
              <button type="button"
                className="xui-pos-absolute xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-cursor-pointer"
                style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--neutral-400)' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <ViewOff size={20} /> : <View size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="message">{errors.confirmPassword.message}</span>}
          </div>

          <div className="xui-form-box">
            <button type="submit"
              className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[16px]"
              style={{ backgroundColor: 'var(--primary-600)', color: '#fff' }}
              disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <p className="xui-font-sz-[13px] xui-text-center">
            <span className="xui-opacity-5">Already have an account? </span>
            <Link href="/login" style={{ color: 'var(--primary-600)' }}>Sign in</Link>
          </p>
        </form>
      </div>

      <Alert id="error-alert" type="error" title="Error" message={errorMessage} />
      <Alert id="success-alert" type="success" title="Success" message={successMessage} />
    </div>
  );
};

export default Signup;
