
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSuccess: (user: { name: string }) => void;
}

type PaymentMethod = 'mastercard' | 'pagomovil' | 'paypal' | 'binance';

const Auth: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // Modal States
  const [showPagoMovilModal, setShowPagoMovilModal] = useState(false);
  const [showMastercardModal, setShowMastercardModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [showBinanceModal, setShowBinanceModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Calculamos la validez de forma directa en cada render
  const canSubmit = () => {
    if (loading) return false;
    
    const { email, password, firstName, lastName, confirmPassword } = formData;
    
    if (mode === 'login') {
      return email.trim().length > 0 && password.trim().length > 0;
    } else {
      const allFieldsFilled = 
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        email.trim().length > 0 &&
        password.trim().length > 0 &&
        confirmPassword.trim().length > 0;
      
      const passwordsMatch = password === confirmPassword;
      const hasPayment = paymentMethod !== null;
      
      return allFieldsFilled && passwordsMatch && hasPayment;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      onSuccess({ 
        name: mode === 'register' ? formData.firstName : (formData.email.split('@')[0] || 'Miguel')
      });
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'pagomovil') setShowPagoMovilModal(true);
    if (method === 'mastercard') setShowMastercardModal(true);
    if (method === 'paypal') setShowPaypalModal(true);
    if (method === 'binance') setShowBinanceModal(true);
  };

  const confirmPayment = (modalSetter: (val: boolean) => void) => {
    alert("¡Pago procesado con éxito, chamo!");
    modalSetter(false);
  };

  const paymentOptions = [
    { id: 'mastercard', name: 'Mastercard', icon: 'credit_card', color: 'bg-slate-900' },
    { id: 'paypal', name: 'PayPal', icon: 'account_balance_wallet', color: 'bg-indigo-600' },
    { id: 'binance', name: 'Binance Pay', icon: 'currency_bitcoin', color: 'bg-yellow-500' },
    { id: 'pagomovil', name: 'Pago Móvil (Bs)', icon: 'smartphone', color: 'bg-red-600' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`¡Copiado al portapapeles!`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto relative">
      
      {/* Modales de Pago con Alertas de Pago Procesado */}
      {showMastercardModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[430px] rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                <span className="material-icons">credit_card</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Datos de Tarjeta</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suscripción Segura</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre en Tarjeta</label>
                <input type="text" placeholder="LUIS PEREZ" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none uppercase font-bold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Tarjeta</label>
                <div className="relative">
                   <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="absolute right-4 top-1/2 -translate-y-1/2 h-4" alt="MC" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimiento</label>
                  <input type="text" placeholder="MM / YY" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-center" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC / CVV</label>
                  <input type="text" placeholder="123" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-center" />
                </div>
              </div>
            </div>

            <button onClick={() => confirmPayment(setShowMastercardModal)} className="w-full py-5 bg-primary text-white font-black rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all">
              Confirmar y Guardar
            </button>
            <button onClick={() => { setPaymentMethod(null); setShowMastercardModal(false); }} className="w-full mt-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showPaypalModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[430px] rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 text-center">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            <h3 className="text-xl font-black text-slate-900 mb-8">Vincular PayPal</h3>
            <button onClick={() => confirmPayment(setShowPaypalModal)} className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all">
              Pagar y Vincular
            </button>
          </div>
        </div>
      )}

      {showBinanceModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-2xl">currency_bitcoin</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Binance Pay</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Escanea o copia los datos</p>
            </div>
            
            <div className="space-y-4">
              {/* QR Section */}
              <div className="flex justify-center">
                <div className="p-3 bg-white border-4 border-yellow-400 rounded-[2rem] shadow-inner">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
                    alt="QR Binance" 
                    className="w-32 h-32"
                  />
                </div>
              </div>

              {/* Data Section */}
              <div className="space-y-2">
                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Binance Pay ID</p>
                    <p className="text-xs font-black text-slate-900 tracking-wider">123456789</p>
                  </div>
                  <button onClick={() => copyToClipboard('123456789')} className="p-2 text-primary">
                    <span className="material-icons text-sm">content_copy</span>
                  </button>
                </div>

                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Wallet (USDT-BEP20)</p>
                    <p className="text-[9px] font-mono font-bold text-slate-900 truncate">0x71C7656EC...6d8976F</p>
                  </div>
                  <button onClick={() => copyToClipboard('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')} className="p-2 text-primary">
                    <span className="material-icons text-sm">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={() => confirmPayment(setShowBinanceModal)} className="w-full py-4 bg-yellow-500 text-slate-900 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all">
                He realizado el pago
              </button>
              <button onClick={() => { setPaymentMethod(null); setShowBinanceModal(false); }} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPagoMovilModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-2xl">smartphone</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Pago Móvil</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Transfiere en Bolívares</p>
            </div>
            
            <div className="space-y-2 mb-6">
              {[
                { label: 'Banco', value: 'Bancamiga (0172)', copy: '0172' },
                { label: 'Titular', value: 'Vene-English Academy', copy: 'Vene-English Academy' },
                { label: 'Cédula / RIF', value: 'J-12345678-9', copy: '123456789' },
                { label: 'Teléfono', value: '0424-1234567', copy: '04241234567' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between active:bg-slate-100 transition-colors">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">{item.label}</p>
                    <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{item.value}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.copy)}
                    className="w-8 h-8 flex items-center justify-center text-primary bg-white rounded-lg shadow-sm border border-slate-100 active:scale-90 transition-transform"
                  >
                    <span className="material-icons text-xs">content_copy</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button onClick={() => confirmPayment(setShowPagoMovilModal)} className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                He realizado el pago
              </button>
              <button onClick={() => { setPaymentMethod(null); setShowPagoMovilModal(false); }} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
          <span className="material-icons">arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
             <span className="text-white font-black text-lg">V</span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vene-English Academy</span>
        </div>
        <div className="w-10"></div>
      </div>

      <main className="px-8 pb-12 flex-1 flex flex-col">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {mode === 'login' ? '¡Qué bueno verte!' : 'Únete a la academia'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {mode === 'login' ? 'Ingresa para continuar aprendiendo.' : 'Inicia tu camino hoy mismo.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center mb-8 border border-slate-100">
          <button onClick={() => setMode('login')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}>Entrar</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'register' ? 'bg-white shadow-md text-primary' : 'text-slate-400'}`}>Registrarse</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="Luis" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Pérez" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              {/* Selección de Pago */}
              <div className="space-y-3 pt-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePaymentSelect(opt.id as PaymentMethod)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === opt.id 
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                          : 'border-slate-100 bg-white opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${opt.color}`}>
                        <span className="material-icons text-lg">{opt.icon}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tight ${paymentMethod === opt.id ? 'text-primary' : 'text-slate-600'}`}>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
            <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="tu@correo.com" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="••••••••" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <input required name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" placeholder="••••••••" className={`w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : ''}`} />
            </div>
          )}

          <div className="pt-6">
            <button 
              type="submit"
              disabled={!canSubmit()}
              className="w-full bg-primary disabled:bg-slate-200 disabled:opacity-50 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-base uppercase tracking-widest">
                    {mode === 'login' ? 'Entrar ahora' : 'Iniciar 5 Días Gratis'}
                  </span>
                  <span className="material-icons">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      <div className="sticky bottom-0 left-0 right-0 h-1.5 bg-primary z-30 opacity-90"></div>
    </div>
  );
};

export default Auth;
