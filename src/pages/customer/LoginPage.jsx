import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/api/auth';
import { loginSchema, customerRegisterSchema, restaurantOwnerRegisterSchema, agentRegisterSchema } from '@/lib/validators';
import { getRoleRedirectPath } from '@/lib/helpers';
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Store, Bike, Mail, Star, MapPin } from 'lucide-react';

/* ── Stitch Design Tokens (inline) ─────────────────────────── */
const T = {
  displayLg:  { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:57, fontWeight:800, lineHeight:1.12, letterSpacing:'-0.02em' },
  headlineLg: { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:32, fontWeight:700, lineHeight:1.25 },
  headlineMd: { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:28, fontWeight:700, lineHeight:1.29 },
  headlineSm: { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:24, fontWeight:600, lineHeight:1.33 },
  titleLg:    { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:22, fontWeight:600, lineHeight:1.27 },
  titleMd:    { fontFamily:'Inter, sans-serif', fontSize:16, fontWeight:500, lineHeight:1.5, letterSpacing:'0.01em' },
  bodyLg:     { fontFamily:'Inter, sans-serif', fontSize:16, fontWeight:400, lineHeight:1.5 },
  bodySm:     { fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:400, lineHeight:1.43 },
  labelLg:    { fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:500, lineHeight:1.43, letterSpacing:'0.01em' },
  labelMd:    { fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, lineHeight:1.33, letterSpacing:'0.04em' },
  labelSm:    { fontFamily:'Inter, sans-serif', fontSize:11, fontWeight:500, lineHeight:1.45, letterSpacing:'0.04em' },
};

const ROLES = [
  { id:'Customer', label:'Customer', Icon: User },
  { id:'Restaurant Owner', label:'Restaurant', Icon: Store },
  { id:'Delivery Agent', label:'Partner', Icon: Bike },
];

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [role, setRole] = useState('Customer');
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const doLogin = useAuthStore(s => s.login);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const regSchemas = { Customer: customerRegisterSchema, 'Restaurant Owner': restaurantOwnerRegisterSchema, 'Delivery Agent': agentRegisterSchema };
  const regForm = useForm({ resolver: zodResolver(regSchemas[role]) });

  const onLogin = async d => {
    setBusy(true); setMsg(null);
    try {
      const u = await doLogin(d, role);
      navigate(getRoleRedirectPath(u?.role || u?.user_type));
    } catch(e) {
      const ed = e.response?.data?.error;
      setMsg({ t:'error', m: ed?.message || ed?.detail || e.response?.data?.message || 'Login failed.' });
    }
    setBusy(false);
  };

  const onRegister = async d => {
    setBusy(true); setMsg(null);
    try {
      await ({ Customer:()=>authAPI.registerCustomer(d), 'Restaurant Owner':()=>authAPI.registerRestaurantOwner(d), 'Delivery Agent':()=>authAPI.registerDeliveryAgent(d) }[role])();
      setMsg({ t:'ok', m:'🎉 Registration successful! Check your email to verify.' });
      setMode('login');
    } catch(e) {
      const ed = e.response?.data?.error;
      let m = ed?.message || e.response?.data?.message || 'Registration failed.';
      if (ed?.fields && typeof ed.fields === 'object') { const f = Object.values(ed.fields).flat(); if(f.length) m = f.join('. '); }
      setMsg({ t:'error', m });
    }
    setBusy(false);
  };

  const Inp = ({ reg, name, type='text', label, placeholder, err, icon:Ic, showToggle, onInput }) => (
    <div style={{ marginBottom:20 }}>
      <label htmlFor={name} style={{ ...T.labelMd, display:'block', color:'#494551', marginBottom:6, textTransform:'uppercase' }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input id={name} {...reg(name)} type={showToggle ? (showPw?'text':'password') : type} placeholder={placeholder} onInput={onInput}
          style={{ width:'100%', height:48, padding:'0 16px', paddingRight: (showToggle||Ic)?48:16,
            background:'#f8f2fa', border:'1px solid #cbc4d2', borderRadius:12,
            ...T.bodyLg, color:'#1d1b20', outline:'none', transition:'border .15s',
          }}
          onFocus={e => e.target.style.borderColor='#4f378a'}
          onBlur={e => e.target.style.borderColor = err ? '#ba1a1a' : '#cbc4d2'}
        />
        {Ic && !showToggle && <Ic style={{ position:'absolute', right:14, top:13, width:20, height:20, color:'#7a7582', pointerEvents:'none' }} />}
        {showToggle && (
          <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:14, top:13, background:'none', border:'none', cursor:'pointer', color:'#7a7582', padding:0 }}>
            {showPw ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>
        )}
      </div>
      {err && <p style={{ ...T.labelSm, color:'#ba1a1a', marginTop:4 }}>{err.message}</p>}
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Inter, sans-serif' }}>
      {/* ── LEFT PANEL ────────────────────────────────────── */}
      <div style={{ width:'58%', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
        className="hidden lg:flex">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBambUcY_r-O86wcGtA2n6Kd_yXLaKnRwNp43NzjdwezaPaxUuGb2yUjJnolJlyGVKJq0QNKM7HxblGBIrujJw_YZPaN1-dvCycyo2gjjbthHi_6E-8qnSVBQL5yArF1ZkyHgKsjAG2e4jgPjaWdBbEhSVnIBybUH9l257HgfiIyc2del8m7rwHScu00vD3eukZPWEbtSbvVJ6QAsiiRjTjKv0Lf_MOIKs_D_dnj4hR1VMt0bHjXgUSVeRvkRMaTWCyT2AnVwTTBsk"
          alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(30,27,46,0.92) 0%, rgba(30,27,46,0.4) 50%, transparent 100%)' }} />
        <div style={{ position:'relative', zIndex:1, padding:'0 48px 56px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#F26E21', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17.5 7H14.5V4H9.5C6.46 4 4 6.46 4 9.5V20H7V15H11.23L16 20H19.5L14.36 14.62C16.14 13.96 17.5 12.24 17.5 10.25V7Z" fill="white"/></svg>
            </div>
            <span style={{ ...T.displayLg, fontSize:44, color:'#fff' }}>FoodRevolut</span>
          </div>
          <p style={{ ...T.headlineSm, color:'#fff', marginBottom:8 }}>The future of Indian gastronomy.</p>
          <p style={{ ...T.bodyLg, color:'rgba(255,255,255,0.85)', maxWidth:420, marginBottom:28 }}>Experience the finest curated selection of restaurants, delivered with surgical precision to your doorstep.</p>
          <div style={{ display:'flex', gap:12 }}>
            {[['Top Rated', Star],['Hyper-Local', MapPin]].map(([l,Ic])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:999, padding:'6px 14px' }}>
                <Ic size={14} color="#fff" /><span style={{ ...T.labelMd, color:'#fff', textTransform:'uppercase' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'#fdf7ff', overflowY:'auto', minHeight:'100vh' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          {/* Role Tabs */}
          <div style={{ display:'flex', background:'#f2ecf4', borderRadius:16, padding:4, marginBottom:40, border:'1px solid #e6e0e9' }}>
            {ROLES.map(({id,label,Icon:Ic})=>{
              const on = role===id;
              return (
                <button key={id} onClick={()=>{setRole(id);loginForm.reset();regForm.reset();setMsg(null);}}
                  style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 4px', borderRadius:12, border:'none', cursor:'pointer', transition:'all .2s',
                    background: on?'#fff':'transparent', boxShadow: on?'0 1px 3px rgba(0,0,0,0.08)':'none', color: on?'#4f378a':'#7a7582',
                  }}>
                  <Ic size={20} strokeWidth={on?2.2:1.8} />
                  <span style={{ ...T.labelMd, fontWeight: on?600:500, color:'inherit' }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Heading */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h2 style={{ ...T.headlineSm, color:'#1d1b20', marginBottom:4 }}>
              {mode==='login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p style={{ ...T.bodySm, color:'#494551' }}>
              {mode==='login' ? 'Sign in to your account to continue' : 'Join FoodRevolut as ' + (role==='Delivery Agent'?'a Partner':role==='Restaurant Owner'?'a Restaurant':'a Customer')}
            </p>
          </div>

          {/* Alert */}
          {msg && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, marginBottom:20, ...T.bodySm,
              background: msg.t==='error'?'#ffdad6':'#d1fae5', color: msg.t==='error'?'#93000a':'#065f46'
            }}>
              {msg.t==='error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
              {msg.m}
            </div>
          )}

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'#cbc4d2' }} />
            <span style={{ ...T.labelMd, color:'#7a7582', textTransform:'uppercase' }}>sign in with email</span>
            <div style={{ flex:1, height:1, background:'#cbc4d2' }} />
          </div>

          {/* ── LOGIN FORM ──────────────────────────────── */}
          {mode==='login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} style={{ animation:'fade-in .25s ease-out' }}>
              <Inp reg={loginForm.register} name="email" type="email" label="Email Address" placeholder="name@example.com" err={loginForm.formState.errors.email} icon={Mail} />
              <div style={{ position:'relative' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                  <label style={{ ...T.labelMd, color:'#494551', textTransform:'uppercase' }}>Password</label>
                  <button type="button" onClick={()=>setMsg({t:'info',m:'Forgot password coming soon!'})} style={{ background:'none', border:'none', cursor:'pointer', ...T.bodySm, color:'#4f378a', fontWeight:500 }}>Forgot password?</button>
                </div>
                <div style={{ position:'relative' }}>
                  <input {...loginForm.register('password')} type={showPw?'text':'password'} placeholder="••••••••"
                    style={{ width:'100%', height:48, padding:'0 48px 0 16px', background:'#f8f2fa', border:'1px solid #cbc4d2', borderRadius:12, ...T.bodyLg, color:'#1d1b20', outline:'none', transition:'border .15s' }}
                    onFocus={e=>e.target.style.borderColor='#4f378a'} onBlur={e=>e.target.style.borderColor='#cbc4d2'}
                  />
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:14, top:13, background:'none', border:'none', cursor:'pointer', color:'#7a7582', padding:0 }}>
                    {showPw ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
                {loginForm.formState.errors.password && <p style={{ ...T.labelSm, color:'#ba1a1a', marginTop:4 }}>{loginForm.formState.errors.password.message}</p>}
              </div>

              <button type="submit" disabled={busy}
                style={{ width:'100%', height:52, marginTop:28, border:'none', borderRadius:12, cursor:'pointer', ...T.titleMd, fontWeight:600, color:'#fff', background:'#4f378a', transition:'all .15s', opacity:busy?.7:1 }}
                onMouseEnter={e=>{if(!busy)e.currentTarget.style.background='#3d2a70'}} onMouseLeave={e=>e.currentTarget.style.background='#4f378a'}>
                {busy ? <span style={{ display:'inline-block', width:20, height:20, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }}/> : 'Sign In'}
              </button>

            </form>
          )}

          {/* ── REGISTER FORM ───────────────────────────── */}
          {mode==='register' && (
            <form onSubmit={regForm.handleSubmit(onRegister)} style={{ animation:'fade-in .25s ease-out' }}>
              <Inp reg={regForm.register} name="name" label="Full Name" placeholder="John Doe" err={regForm.formState.errors.name} />
              <Inp reg={regForm.register} name="email" type="email" label="Email Address" placeholder="name@example.com" err={regForm.formState.errors.email} icon={Mail} />
              <Inp reg={regForm.register} name="phone" type="tel" label="Phone Number" placeholder="+91 9876543210" err={regForm.formState.errors.phone} onInput={(e) => { e.target.value = e.target.value.replace(/[^\d+]/g, ''); }} />
              <Inp reg={regForm.register} name="password" label="Password" placeholder="min. 8 characters" err={regForm.formState.errors.password} showToggle />

              {role==='Delivery Agent' && (
                <div style={{ padding:16, background:'#f2ecf4', borderRadius:12, marginBottom:20 }}>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ ...T.labelMd, display:'block', color:'#494551', marginBottom:6, textTransform:'uppercase' }}>Vehicle Type</label>
                    <select {...regForm.register('vehicle_type')} style={{ width:'100%', height:48, padding:'0 16px', background:'#fff', border:'1px solid #cbc4d2', borderRadius:12, ...T.bodyLg, color:'#1d1b20', outline:'none', appearance:'none', cursor:'pointer' }}>
                      <option value="">Select vehicle</option>
                      <option value="BIKE">Bike</option>
                      <option value="SCOOTER">Scooter</option>
                      <option value="BICYCLE">Bicycle</option>
                    </select>
                    {regForm.formState.errors.vehicle_type && <p style={{ ...T.labelSm, color:'#ba1a1a', marginTop:4 }}>{regForm.formState.errors.vehicle_type.message}</p>}
                  </div>
                  <Inp reg={regForm.register} name="vehicle_number" label="Vehicle Number" placeholder="DL 01 AB 1234" err={regForm.formState.errors.vehicle_number} />
                  <Inp reg={regForm.register} name="driving_license" label="Driving License" placeholder="License Number" err={regForm.formState.errors.driving_license} />
                </div>
              )}

              <button type="submit" disabled={busy}
                style={{ width:'100%', height:52, marginTop:8, border:'none', borderRadius:12, cursor:'pointer', ...T.titleMd, fontWeight:600, color:'#fff', background:'#4f378a', transition:'all .15s', opacity:busy?.7:1 }}
                onMouseEnter={e=>{if(!busy)e.currentTarget.style.background='#3d2a70'}} onMouseLeave={e=>e.currentTarget.style.background='#4f378a'}>
                {busy ? <span style={{ display:'inline-block', width:20, height:20, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }}/> : 'Create Account'}
              </button>
            </form>
          )}

          {/* Toggle */}
          <p style={{ textAlign:'center', marginTop:32, ...T.bodySm, color:'#494551' }}>
            {mode==='login' ? <>Don't have an account?{' '}<button onClick={()=>{setMode('register');setMsg(null)}} style={{ background:'none', border:'none', cursor:'pointer', ...T.bodySm, color:'#4f378a', fontWeight:600, textDecoration:'underline' }}>Create account</button></> :
              <>Already have an account?{' '}<button onClick={()=>{setMode('login');setMsg(null)}} style={{ background:'none', border:'none', cursor:'pointer', ...T.bodySm, color:'#4f378a', fontWeight:600, textDecoration:'underline' }}>Sign in</button></>}
          </p>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:20, paddingTop:20, borderTop:'1px solid #e6e0e9' }}>
            {['Privacy Policy','Terms of Service','Help Center'].map(l=>(
              <a key={l} href="#" style={{ ...T.labelMd, color:'#7a7582', textDecoration:'none', transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#4f378a'} onMouseLeave={e=>e.currentTarget.style.color='#7a7582'}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
