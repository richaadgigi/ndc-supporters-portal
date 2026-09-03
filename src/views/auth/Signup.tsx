'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { View, ViewOff } from '@carbon/icons-react';
import { APP_NAME } from '../../Globals';
import authService from '../../services/auth.service';
import geographyService from '../../services/geography.service';
import type { GeoItem } from '../../services/geography.service';
import { Alert, showAlert, PhoneNumberInput, DateOfBirthSelect, SearchableSelect } from '../../components/common';
import { extractErrorMessage } from '../../utils/formatters';
import { COUNTRIES } from '../../utils/countries';

interface SignupFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  nin: string;
  country: string;
  state: string;
  lga: string;
  ward: string;
  constituency: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}

const STEPS = [
  { label: 'Personal', fields: ['firstname', 'middlename', 'lastname', 'gender', 'date_of_birth', 'nin'] },
  { label: 'Location', fields: ['country', 'state', 'lga', 'ward', 'constituency'] },
  { label: 'Account', fields: ['email', 'phone_number', 'password', 'confirmPassword'] },
] as const;

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [states, setStates] = useState<GeoItem[]>([]);
  const [lgas, setLgas] = useState<GeoItem[]>([]);
  const [wards, setWards] = useState<GeoItem[]>([]);
  const [constituencies, setConstituencies] = useState<GeoItem[]>([]);
  const [stateId, setStateId] = useState('');
  const [lgaId, setLgaId] = useState('');
  const [zone, setZone] = useState('');

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<SignupFormData>({
    defaultValues: {
      firstname: '', middlename: '', lastname: '', gender: '', date_of_birth: '', nin: '',
      country: 'Nigeria', state: '', lga: '', ward: '', constituency: '',
      email: '', phone_number: '', password: '', confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const isNigeria = (watch('country') || '').trim().toLowerCase() === 'nigeria';

  const onCountryChange = (val: string) => {
    setValue('country', val);
    setStateId('');
    setLgaId('');
    setZone('');
    setValue('state', '');
    setValue('lga', '');
    setValue('ward', '');
    setValue('constituency', '');
  };

  useEffect(() => {
    geographyService.getStates().then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    if (!stateId) { setLgas([]); setConstituencies([]); return; }
    geographyService.getLgas(stateId).then(setLgas).catch(() => setLgas([]));
    geographyService.getConstituencies(stateId).then(setConstituencies).catch(() => setConstituencies([]));
  }, [stateId]);

  useEffect(() => {
    if (!lgaId) { setWards([]); return; }
    geographyService.getWards(lgaId).then(setWards).catch(() => setWards([]));
  }, [lgaId]);

  const onStateChange = (id: string) => {
    const picked = states.find(s => String(s.id) === id);
    setStateId(id);
    setLgaId('');
    setValue('state', picked?.name || '');
    setValue('lga', '');
    setValue('ward', '');
    setValue('constituency', '');
    setZone(picked?.region || '');
  };

  const onLgaChange = (id: string) => {
    const picked = lgas.find(l => String(l.id) === id);
    setLgaId(id);
    setValue('lga', picked?.name || '');
    setValue('ward', '');
  };

  const next = async () => {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof SignupFormData)[]);
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

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
        ...(data.country.trim() && { country: data.country.trim() }),
        ...(zone && { zone }),
        ...(data.state && { state: data.state }),
        ...(data.lga && { lga: data.lga }),
        ...(data.ward && { ward: data.ward }),
        ...(data.constituency && { constituency: data.constituency }),
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
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(extractErrorMessage(err, 'Failed to create account'));
      showAlert('error-alert');
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

        <div className="xui-d-flex xui-grid-gap-0 xui-mb-2" style={{ flexWrap: 'nowrap', borderBottom: '2px solid var(--neutral-200)' }}>
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => { if (i < step) setStep(i); }}
              className="xui-btn xui-font-sz-85"
              style={{
                borderRadius: 0, backgroundColor: 'transparent', marginBottom: '-2px',
                padding: '10px 12px', whiteSpace: 'nowrap', flexShrink: 0,
                borderBottom: step === i ? '2px solid var(--primary-600)' : '2px solid transparent',
                color: step === i ? 'var(--primary-600)' : 'inherit',
                fontWeight: step === i ? 600 : 400,
                cursor: i < step ? 'pointer' : 'default',
              }}
            >
              <span
                className="xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center"
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', marginRight: '8px', fontSize: '11px',
                  backgroundColor: step >= i ? 'var(--primary-600)' : 'var(--neutral-300)',
                  color: step >= i ? '#fff' : 'var(--neutral-600)',
                }}
              >
                {i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="xui-form">
          <div style={{ display: step === 0 ? 'block' : 'none' }}>
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
          </div>

          <div style={{ display: step === 1 ? 'block' : 'none' }}>
            <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
              <div className="xui-form-box" {...(errors.country && { 'xui-error': 'true' })}>
                <label htmlFor="country">Country</label>
                <SearchableSelect
                  id="country"
                  value={watch('country')}
                  options={COUNTRIES}
                  placeholder="Select your country"
                  searchPlaceholder="Search country..."
                  onChange={onCountryChange}
                />
                <input type="hidden" {...register('country', { maxLength: { value: 50, message: 'Maximum 50 characters' } })} />
                {errors.country && <span className="message">{errors.country.message}</span>}
              </div>

              {isNigeria ? (
                <div className="xui-form-box" {...(errors.state && { 'xui-error': 'true' })}>
                  <label htmlFor="state">State</label>
                  <select id="state" value={stateId} onChange={(e) => onStateChange(e.target.value)}>
                    <option value="">Select your state</option>
                    {states.map((st) => (
                      <option key={st.id} value={String(st.id)}>{st.name}</option>
                    ))}
                  </select>
                  <input type="hidden" {...register('state')} />
                  {errors.state && <span className="message">{errors.state.message}</span>}
                </div>
              ) : (
                <div className="xui-form-box" {...(errors.state && { 'xui-error': 'true' })}>
                  <label htmlFor="state">State / Province</label>
                  <input type="text" id="state" placeholder="Enter your state or province"
                    {...register('state', { maxLength: { value: 100, message: 'Maximum 100 characters' } })} />
                  {errors.state && <span className="message">{errors.state.message}</span>}
                </div>
              )}
            </div>

            <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
              {isNigeria ? (
                <div className="xui-form-box" {...(errors.lga && { 'xui-error': 'true' })}>
                  <label htmlFor="lga">LGA</label>
                  <select id="lga" value={lgaId} onChange={(e) => onLgaChange(e.target.value)} disabled={!stateId}>
                    <option value="">{stateId ? 'Select your LGA' : 'Select a state first'}</option>
                    {lgas.map((l) => (
                      <option key={l.id} value={String(l.id)}>{l.name}</option>
                    ))}
                  </select>
                  <input type="hidden" {...register('lga')} />
                  {errors.lga && <span className="message">{errors.lga.message}</span>}
                </div>
              ) : (
                <div className="xui-form-box" {...(errors.lga && { 'xui-error': 'true' })}>
                  <label htmlFor="lga">City</label>
                  <input type="text" id="lga" placeholder="Enter your city"
                    {...register('lga', { maxLength: { value: 100, message: 'Maximum 100 characters' } })} />
                  {errors.lga && <span className="message">{errors.lga.message}</span>}
                </div>
              )}

              {isNigeria && (
                <div className="xui-form-box">
                  <label htmlFor="ward">Ward</label>
                  <select id="ward" value={watch('ward')} onChange={(e) => setValue('ward', e.target.value)} disabled={!lgaId}>
                    <option value="">{lgaId ? 'Select your ward' : 'Select an LGA first'}</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {isNigeria && (
              <div className="xui-form-box">
                <label htmlFor="constituency">Constituency</label>
                <select id="constituency" value={watch('constituency')} onChange={(e) => setValue('constituency', e.target.value)} disabled={!stateId}>
                  <option value="">{stateId ? 'Select your constituency' : 'Select a state first'}</option>
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div style={{ display: step === 2 ? 'block' : 'none' }}>
            <div className="xui-form-box" {...(errors.email && { 'xui-error': 'true' })}>
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" placeholder="Enter email address"
                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } })} />
              {errors.email && <span className="message">{errors.email.message}</span>}
            </div>

            <PhoneNumberInput control={control} name="phone_number" label="Phone Number" id="phone_number" />

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
          </div>

          <div className={`xui-d-grid xui-grid-gap-1 xui-mt-1 ${step > 0 ? 'xui-grid-col-1 xui-lg-grid-col-2' : 'xui-grid-col-1'}`}>
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[16px]"
                style={{ backgroundColor: 'transparent', border: '1px solid var(--neutral-300)', color: 'inherit' }}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next}
                className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[16px]"
                style={{ backgroundColor: 'var(--primary-600)', color: '#fff' }}>
                Continue
              </button>
            ) : (
              <button type="submit" disabled={isLoading}
                className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[16px]"
                style={{ backgroundColor: 'var(--primary-600)', color: '#fff' }}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>

          <p className="xui-font-sz-[13px] xui-text-center xui-mt-1">
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
