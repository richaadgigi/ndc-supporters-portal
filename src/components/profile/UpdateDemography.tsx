'use client';
import { useState, useEffect } from 'react';
import { Location } from '@carbon/icons-react';
import membersService from '../../services/members.service';
import geographyService from '../../services/geography.service';
import type { GeoItem } from '../../services/geography.service';
import type { Member } from '../../services/members.service';
import { showAlert } from '../common';
import { extractErrorMessage } from '../../utils/formatters';

interface UpdateDemographyProps {
  profile: Member | null;
  onSuccess: () => void;
  setError: (message: string) => void;
  setSuccessMessage: (message: string) => void;
}

const matchByName = (items: GeoItem[], name?: string | null): GeoItem | undefined => {
  if (!name) return undefined;
  const target = name.trim().toLowerCase();
  return items.find((i) => i.name.trim().toLowerCase() === target);
};

const UpdateDemography = ({ profile, onSuccess, setError, setSuccessMessage }: UpdateDemographyProps) => {
  const [states, setStates] = useState<GeoItem[]>([]);
  const [lgas, setLgas] = useState<GeoItem[]>([]);
  const [wards, setWards] = useState<GeoItem[]>([]);
  const [constituencies, setConstituencies] = useState<GeoItem[]>([]);

  const [stateId, setStateId] = useState('');
  const [lgaId, setLgaId] = useState('');
  const [zone, setZone] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [ward, setWard] = useState('');
  const [constituency, setConstituency] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    geographyService.getStates().then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    if (!profile || states.length === 0) return;
    setWard(profile.ward || '');
    setConstituency(profile.constituency || '');
    setZone(profile.zone || '');
    const matchedState = matchByName(states, profile.state);
    if (matchedState) {
      setStateId(String(matchedState.id));
      setState(matchedState.name);
      setZone(profile.zone || matchedState.region || '');
    }
  }, [profile, states]);

  useEffect(() => {
    if (!stateId) { setLgas([]); setConstituencies([]); return; }
    geographyService.getLgas(stateId).then(setLgas).catch(() => setLgas([]));
    geographyService.getConstituencies(stateId).then(setConstituencies).catch(() => setConstituencies([]));
  }, [stateId]);

  useEffect(() => {
    if (lgas.length === 0 || !profile?.lga || lgaId) return;
    const matchedLga = matchByName(lgas, profile.lga);
    if (matchedLga) {
      setLgaId(String(matchedLga.id));
      setLga(matchedLga.name);
    }
  }, [lgas, profile?.lga, lgaId]);

  useEffect(() => {
    if (!lgaId) { setWards([]); return; }
    geographyService.getWards(lgaId).then(setWards).catch(() => setWards([]));
  }, [lgaId]);

  const onStateChange = (id: string) => {
    const picked = states.find((s) => String(s.id) === id);
    setStateId(id);
    setLgaId('');
    setState(picked?.name || '');
    setZone(picked?.region || '');
    setLga('');
    setWard('');
    setConstituency('');
  };

  const onLgaChange = (id: string) => {
    const picked = lgas.find((l) => String(l.id) === id);
    setLgaId(id);
    setLga(picked?.name || '');
    setWard('');
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const response = await membersService.portalUpdateDemography({
        ...(zone && { zone }),
        ...(state && { state }),
        ...(lga && { lga }),
        ...(ward && { ward }),
        ...(constituency && { constituency }),
      });

      if (response.success) {
        setSuccessMessage('Location updated successfully');
        showAlert('success-alert');
        onSuccess();
      } else {
        setError(response.message || 'Failed to update location');
        showAlert('error-alert');
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update location'));
      showAlert('error-alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="xui-bg-white xui-bdr-rad-[8px] xui-p-1-half" style={{ border: '1px solid var(--neutral-200)' }}>
      <div className="xui-d-flex xui-flex-ai-center xui-grid-gap-half xui-pb-1" style={{ borderBottom: '1px solid var(--neutral-100)' }}>
        <Location size={18} style={{ color: 'var(--neutral-600)' }} />
        <h3 className="xui-font-sz-[16px] xui-font-w-600" style={{ color: 'var(--neutral-900)', margin: 0 }}>My Location</h3>
      </div>

      <div className="xui-form xui-mt-1">
        <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
          <div className="xui-form-box">
            <label htmlFor="demo_state">State</label>
            <select id="demo_state" value={stateId} onChange={(e) => onStateChange(e.target.value)}>
              <option value="">Select your state</option>
              {states.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="xui-form-box">
            <label htmlFor="demo_lga">LGA</label>
            <select id="demo_lga" value={lgaId} onChange={(e) => onLgaChange(e.target.value)} disabled={!stateId}>
              <option value="">{stateId ? 'Select your LGA' : 'Select a state first'}</option>
              {lgas.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-2 xui-grid-gap-1">
          <div className="xui-form-box">
            <label htmlFor="demo_ward">Ward</label>
            <select id="demo_ward" value={ward} onChange={(e) => setWard(e.target.value)} disabled={!lgaId}>
              <option value="">{lgaId ? 'Select your ward' : 'Select an LGA first'}</option>
              {wards.map((w) => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="xui-form-box">
            <label htmlFor="demo_constituency">Constituency</label>
            <select id="demo_constituency" value={constituency} onChange={(e) => setConstituency(e.target.value)} disabled={!stateId}>
              <option value="">{stateId ? 'Select your constituency' : 'Select a state first'}</option>
              {constituencies.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || !state}
          className="xui-btn xui-btn-block xui-bdr-rad-[8px] xui-font-sz-[13px] xui-py-[14px] xui-mt-1"
          style={{ backgroundColor: 'var(--primary-600)', color: '#fff' }}
        >
          {saving ? 'Saving...' : 'Update Location'}
        </button>
      </div>
    </div>
  );
};

export default UpdateDemography;
