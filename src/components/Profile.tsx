
import React, { useState, useRef } from 'react';
import { type User, CEFRLevel, type Certification } from '../types';

interface Props {
  user: User;
  onUpdateUser: (updatedFields: Partial<User>) => void;
  onLogout: () => void;
}

type PaymentMethod = 'mastercard' | 'pagomovil' | 'paypal' | 'binance';

const Profile: React.FC<Props> = ({ user, onUpdateUser, onLogout }) => {
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar || `https://picsum.photos/seed/${user.name}/200/200`);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Billing States
  const [showBillingOptions, setShowBillingOptions] = useState(false);
  const [activePaymentModal, setActivePaymentModal] = useState<PaymentMethod | null>(null);

  const achievements = [
    { id: 1, name: 'Primer Paso', icon: 'rocket_launch', color: 'bg-blue-500', earned: true },
    { id: 2, name: 'Chamo Pro', icon: 'face', color: 'bg-accent-yellow', earned: true },
    { id: 3, name: 'Semana de Oro', icon: 'workspace_premium', color: 'bg-orange-500', earned: true },
    { id: 4, name: 'Certificado A1', icon: 'verified', color: 'bg-green-500', earned: user.earnedCertificates.some(c => c.level === CEFRLevel.A1) },
    { id: 5, name: 'Búho Nocturno', icon: 'nights_stay', color: 'bg-purple-500', earned: false },
    { id: 6, name: 'Políglota', icon: 'language', color: 'bg-pink-500', earned: false },
  ];

  const handleDownloadCert = (certId: string) => {
    setDownloadingCertId(certId);
    setTimeout(() => {
      setDownloadingCertId(null);
      alert("Certificado descargado correctamente.");
    }, 1500);
  };

  const handleSaveSettings = () => {
    onUpdateUser({ name: editName, avatar: editAvatar });
    setShowSettings(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`¡Copiado al portapapeles!`);
  };

  const paymentOptions = [
    { id: 'mastercard', name: 'Mastercard', icon: 'credit_card', color: 'bg-slate-900' },
    { id: 'paypal', name: 'PayPal', icon: 'account_balance_wallet', color: 'bg-indigo-600' },
    { id: 'binance', name: 'Binance Pay', icon: 'currency_bitcoin', color: 'bg-yellow-500' },
    { id: 'pagomovil', name: 'Pago Móvil (Bs)', icon: 'smartphone', color: 'bg-red-600' },
  ];

  const levels = Object.values(CEFRLevel);
  const displayCertifications = levels
    .map(lvl => {
      const earned = user.earnedCertificates.find(c => c.level === lvl);
      if (earned) {
        return { ...earned, status: 'Obtenida' as const };
      }
      const isNext = lvl === user.level;
      if (isNext) {
        return {
          id: `pending-${lvl}`,
          level: lvl,
          name: lvl === CEFRLevel.A1 ? 'Acceso y Supervivencia' : 
                lvl === CEFRLevel.A2 ? 'Plataforma e Intercambio' : 
                lvl === CEFRLevel.B1 ? 'Umbral de Autonomía' : 
                'Certificación de Nivel',
          status: 'En Progreso' as const,
          date: 'Esperada pronto',
          issuer: 'Vene-English Academy'
        };
      }
      return null;
    })
    .filter((cert): cert is NonNullable<typeof cert> => cert !== null);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-28">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-slate-900">Editar Perfil</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personaliza tu cuenta</p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-lg">
                  <img src={editAvatar} alt="Edit Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-icons text-white">photo_camera</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>

              <div className="w-full space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Tu nombre..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSaveSettings}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                Guardar Cambios
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Options Modal */}
      {showBillingOptions && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Facturación</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Selecciona un método para ver detalles</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActivePaymentModal(opt.id as PaymentMethod);
                    setShowBillingOptions(false);
                  }}
                  className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${opt.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <span className="material-icons text-xl">{opt.icon}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-600 group-hover:text-primary">{opt.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowBillingOptions(false)}
              className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Detail Billing Modals */}
      {activePaymentModal === 'mastercard' && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
             <div className="text-center mb-6">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-icons text-2xl">credit_card</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Vincular Tarjeta</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Suscripción Premium</p>
             </div>
             <div className="space-y-4 mb-8">
                <input type="text" placeholder="Número de Tarjeta" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm text-center outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="CVC" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm text-center outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
             </div>
             <button onClick={() => { alert("Tarjeta vinculada con éxito."); setActivePaymentModal(null); }} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all mb-3">Guardar Método</button>
             <button onClick={() => setActivePaymentModal(null)} className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atrás</button>
          </div>
        </div>
      )}

      {activePaymentModal === 'paypal' && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500 text-center">
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-2xl">account_balance_wallet</span>
             </div>
             <h3 className="text-lg font-black text-slate-900 mb-2">PayPal Academy</h3>
             <p className="text-xs text-slate-500 mb-8 font-medium">Serás redirigido a PayPal para autorizar la suscripción mensual.</p>
             <button onClick={() => { alert("Vinculando con PayPal..."); setActivePaymentModal(null); }} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all mb-3">Continuar a PayPal</button>
             <button onClick={() => setActivePaymentModal(null)} className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Atrás</button>
          </div>
        </div>
      )}

      {activePaymentModal === 'binance' && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-2xl">currency_bitcoin</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Binance Pay</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Datos de la Academia</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white border-4 border-yellow-400 rounded-[2rem] shadow-inner">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F" alt="QR" className="w-32 h-32" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Binance Pay ID</p>
                    <p className="text-xs font-black text-slate-900 tracking-wider">123456789</p>
                  </div>
                  <button onClick={() => copyToClipboard('123456789')} className="p-2 text-primary"><span className="material-icons text-sm">content_copy</span></button>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button onClick={() => setActivePaymentModal(null)} className="w-full py-4 bg-yellow-500 text-slate-900 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all">Hecho</button>
              <button onClick={() => setActivePaymentModal(null)} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Atrás</button>
            </div>
          </div>
        </div>
      )}

      {activePaymentModal === 'pagomovil' && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-2xl">smartphone</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Pago Móvil Academy</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Datos para Transferencia</p>
            </div>
            <div className="space-y-2 mb-6">
              {[
                { label: 'Banco', value: 'Bancamiga (0172)', copy: '0172' },
                { label: 'Cédula / RIF', value: 'J-12345678-9', copy: '123456789' },
                { label: 'Teléfono', value: '0424-1234567', copy: '04241234567' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">{item.label}</p>
                    <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{item.value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.copy)} className="w-8 h-8 flex items-center justify-center text-primary bg-white rounded-lg border border-slate-100 active:scale-90 transition-transform">
                    <span className="material-icons text-xs">content_copy</span>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setActivePaymentModal(null)} className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">Finalizar</button>
          </div>
        </div>
      )}

      {/* Header / Cover area */}
      <div className="h-56 bg-gradient-to-br from-primary via-blue-600 to-indigo-800 relative shrink-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="absolute top-12 right-6">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 active:scale-90 transition-all"
          >
            <span className="material-icons">settings</span>
          </button>
        </div>

        {/* Contenedor de Avatar y Nombre */}
        <div className="absolute -bottom-20 left-0 right-0 px-8 flex items-end gap-6">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 bg-white rounded-[2.5rem] shadow-xl"></div>
            <img 
              alt="Avatar" 
              className="relative w-28 h-28 rounded-[2rem] object-cover shadow-inner bg-slate-100" 
              src={user.avatar || `https://picsum.photos/seed/${user.name}/200/200`} 
            />
            <div className="absolute -top-1 -right-1 bg-accent-yellow text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border-2 border-white transform rotate-3">
              NIVEL {user.level}
            </div>
          </div>
          
          <div className="flex-1 pb-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-10 mb-1.5 drop-shadow-sm">
              {user.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                Estudiante Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-28 px-8 space-y-8">
        
        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Racha', val: `${user.streak}d`, icon: 'local_fire_department', color: 'text-accent-orange', bg: 'bg-accent-orange/5' },
            { label: 'Palabras', val: user.wordsLearned, icon: 'translate', color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Horas', val: `${user.practiceHours}h`, icon: 'schedule', color: 'text-purple-500', bg: 'bg-purple-500/5' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-4 rounded-3xl border border-white shadow-sm text-center flex flex-col items-center gap-1.5`}>
              <span className={`material-icons ${stat.color} text-xl`}>{stat.icon}</span>
              <div>
                <p className="text-sm font-black text-slate-800 leading-none">{stat.val}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Certificaciones Obtenidas */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mis Certificados</h2>
          </div>
          <div className="space-y-3">
            {displayCertifications.map((cert) => (
              <div key={cert.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden">
                <div className={`w-14 h-14 shrink-0 ${cert.status === 'Obtenida' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-200'} rounded-2xl flex items-center justify-center border border-slate-100`}>
                  <span className="font-black text-xl">{cert.level}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 leading-tight">{cert.name}</h4>
                  <p className={`text-[9px] font-black uppercase mt-1 ${cert.status === 'Obtenida' ? 'text-green-500' : 'text-primary'}`}>{cert.status}</p>
                </div>
                {cert.status === 'Obtenida' && (
                  <button onClick={() => handleDownloadCert(cert.id)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 active:scale-90 transition-all">
                    <span className="material-icons text-lg">download</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Logros */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Insignias</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {achievements.map((ach) => (
              <div key={ach.id} className={`shrink-0 flex flex-col items-center gap-2 ${!ach.earned ? 'opacity-30' : ''}`}>
                <div className={`${ach.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <span className="material-icons text-xl">{ach.icon}</span>
                </div>
                <span className="text-[8px] font-black text-slate-600 uppercase text-center">{ach.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Account Menu */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {/* Notifications Item */}
          <div className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="material-icons text-slate-400">notifications_active</span>
              <span className="text-sm font-bold text-slate-700">Notificaciones</span>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${notificationsEnabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${notificationsEnabled ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <button 
            onClick={() => setShowBillingOptions(true)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="material-icons text-slate-400">credit_card</span>
              <span className="text-sm font-bold text-slate-700">Método de Facturación</span>
            </div>
            <span className="material-icons text-slate-200">chevron_right</span>
          </button>
          
          <button onClick={onLogout} className="w-full px-6 py-5 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors">
            <span className="material-icons">power_settings_new</span>
            <span className="text-sm font-black uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;
