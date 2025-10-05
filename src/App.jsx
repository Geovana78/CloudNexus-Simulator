import React, { useState, useCallback, useMemo, memo, useRef } from 'react';
import { Shield, Target, Award, Zap, CheckCircle, X } from 'lucide-react';

// ✅ SISTEMA DE RETOS COMPLETO
const challenges = [
  {
    id: 'mfa-ana-garcia',
    title: 'Habilitar MFA a Ana García',
    area: 'MFA', 
    instructions: 'Activa MFA específicamente para la usuaria Ana García.',
    verify: (state) => {
      const user = state.users.find(u => u.firstName === 'Ana' && u.lastName === 'García');
      if (!user) return { success: false, message: 'No se encuentra Ana García.' };
      const hasMFA = state.mfaEnabled.has(user.email);
      return hasMFA
        ? { success: true, message: '¡Excelente! Ana García ahora tiene MFA habilitado.' }
        : { success: false, message: 'Ana García aún no tiene MFA habilitado.' };
    }
  },
  {
    id: 'mfa-carlos-lopez',
    title: 'Habilitar MFA a Carlos López',
    area: 'MFA',
    instructions: 'Activa MFA específicamente para Carlos López.',
    verify: (state) => {
      const user = state.users.find(u => u.firstName === 'Carlos' && u.lastName === 'López');
      if (!user) return { success: false, message: 'No se encuentra Carlos López.' };
      const hasMFA = state.mfaEnabled.has(user.email);
      return hasMFA
        ? { success: true, message: '¡Perfecto! Carlos López tiene MFA habilitado.' }
        : { success: false, message: 'Carlos López aún no tiene MFA.' };
    }
  },
  {
    id: 'mfa-grupo-usuarios-estandar',
    title: 'Habilitar MFA al grupo "Usuarios Estándar"',
    area: 'MFA',
    instructions: 'Activa MFA para todos los miembros del grupo "Usuarios Estándar".',
    verify: (state) => {
      const group = state.groups.find(g => g.name === 'Usuarios Estándar');
      if (!group) return { success: false, message: 'No existe el grupo "Usuarios Estándar".' };
      if (!group.members?.length) return { success: false, message: 'El grupo no tiene miembros.' };
      const allHave = group.members.every(email => state.mfaEnabled.has(email));
      return allHave
        ? { success: true, message: '¡Perfecto! Todo el grupo tiene MFA.' }
        : { success: false, message: 'Aún hay miembros sin MFA.' };
    }
  },
  {
    id: 'mfa-todos',
    title: 'Habilitar MFA a todos los usuarios',
    area: 'MFA',
    instructions: 'Activa MFA para el 100% de los usuarios.',
    verify: (state) => {
      if (!state.users.length) return { success: false, message: 'No hay usuarios registrados.' };
      const all = state.users.every(u => state.mfaEnabled.has(u.email));
      return all
        ? { success: true, message: '¡Excelente! Todos los usuarios tienen MFA.' }
        : { success: false, message: 'Aún faltan usuarios sin MFA.' };
    }
  },
  {
    id: 'mfa-sin-administradores',
    title: 'MFA para todos excepto administradores',
    area: 'MFA',
    instructions: 'Habilita MFA para todos los usuarios que NO sean del grupo "Administradores".',
    verify: (state) => {
      const adminGroup = state.groups.find(g => g.name === 'Administradores');
      const nonAdminUsers = adminGroup 
        ? state.users.filter(u => !adminGroup.members.includes(u.email))
        : state.users;
      
      if (!nonAdminUsers.length) return { success: false, message: 'No hay usuarios no administradores.' };
      
      const allNonAdminsHaveMFA = nonAdminUsers.every(u => state.mfaEnabled.has(u.email));
      return allNonAdminsHaveMFA
        ? { success: true, message: '¡Perfecto! Todos los usuarios no administradores tienen MFA.' }
        : { success: false, message: 'Aún hay usuarios no administradores sin MFA.' };
    }
  }
];

// ✅ HOOK DE NOTIFICACIONES MEJORADO
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = useRef(new Map());

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      timeoutsRef.current.delete(id);
    }, 5000);

    timeoutsRef.current.set(id, timeoutId);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  return { notifications, addNotification, removeNotification };
};

// ✅ COMPONENTE NOTIFICACIONES
const NotificationContainer = memo(({ notifications, removeNotification }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map(notification => (
      <div
        key={notification.id}
        className={`
          p-4 rounded-xl border shadow-lg backdrop-blur-sm transform transition-all duration-300
          ${notification.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-100' 
            : 'bg-red-500/20 border-red-500/30 text-red-100'
          }
        `}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <X className="w-5 h-5 text-red-400" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
));

// ✅ COMPONENTES DE DISEÑO
const ModernHeader = memo(({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-gray-400 mt-1">{subtitle}</p>
    </div>
  </div>
));

const ModernCard = memo(({ children, className = "" }) => (
  <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl ${className}`}>
    {children}
  </div>
));

const ModernButton = memo(({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary",
  icon: Icon,
  className = "" 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    secondary: "bg-gray-700 hover:bg-gray-600",
    success: "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold text-white
        transform hover:scale-105 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center gap-2
        ${variants[variant]} ${className}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
});

// ✅ COMPONENTE TABS MEJORADO
const Tabs = memo(({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'mfa', label: 'MFA', icon: Shield },
    { id: 'conditional-access', label: 'Conditional Access', icon: Zap },
    { id: 'pim', label: 'PIM', icon: Award },
  ];

  return (
    <div className="flex gap-1 bg-gray-800/50 rounded-2xl p-2 mb-8">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2
            ${activeTab === t.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <t.icon className="w-5 h-5" /> {t.label}
        </button>
      ))}
    </div>
  );
});

// ✅ HOOKS DE LÓGICA
const useMFAOperations = () => {
  const enableMFA = useCallback((selectedUsers, setAzureState) => {
    setAzureState(prev => ({
      ...prev,
      mfaEnabled: new Set([...prev.mfaEnabled, ...selectedUsers])
    }));
  }, []);

  const disableMFA = useCallback((users, setAzureState) => {
    setAzureState(prev => {
      const newMfaEnabled = new Set(prev.mfaEnabled);
      users.forEach(user => newMfaEnabled.delete(user));
      return { ...prev, mfaEnabled: newMfaEnabled };
    });
  }, []);

  const enableMFAForGroup = useCallback((selectedGroupId, azureState, setAzureState) => {
    const group = azureState.groups.find(g => g.id === selectedGroupId);
    if (group) {
      setAzureState(prev => ({
        ...prev,
        mfaEnabled: new Set([...prev.mfaEnabled, ...group.members])
      }));
    }
    return !!group;
  }, []);

  return { enableMFA, disableMFA, enableMFAForGroup };
};

// ✅ COMPONENTE MFATAB MEJORADO
const MFATab = memo(({ azureState, setAzureState, addNotification }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const { enableMFA, disableMFA, enableMFAForGroup } = useMFAOperations();

  const toggleUser = useCallback((email) => {
    setSelectedUsers(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  }, []);

  const handleEnableMFA = useCallback(() => {
    const newUsers = selectedUsers.filter(user => !azureState.mfaEnabled.has(user));
    
    if (newUsers.length === 0) {
      addNotification('Los usuarios seleccionados ya tienen MFA habilitado', 'error');
      return;
    }

    enableMFA(newUsers, setAzureState);
    addNotification(`MFA habilitado para ${newUsers.length} usuario(s)`);
    setSelectedUsers([]);
  }, [selectedUsers, azureState.mfaEnabled, enableMFA, addNotification]);

  const handleDisableMFA = useCallback((users) => {
    disableMFA(users, setAzureState);
    addNotification(`MFA revocado para ${users.length} usuario(s)`);
  }, [disableMFA, addNotification]);

  const handleEnableMFAForGroup = useCallback(() => {
    const success = enableMFAForGroup(selectedGroupId, azureState, setAzureState);
    if (success) {
      addNotification('MFA habilitado para todos los miembros del grupo');
      setSelectedGroupId(null);
    } else {
      addNotification('Error al habilitar MFA para el grupo', 'error');
    }
  }, [selectedGroupId, azureState, enableMFAForGroup, addNotification]);

  const usersList = useMemo(() => 
    azureState.users.map(user => ({
      ...user,
      isSelected: selectedUsers.includes(user.email),
      hasMFA: azureState.mfaEnabled.has(user.email)
    }))
  , [azureState.users, selectedUsers, azureState.mfaEnabled]);

  const usersWithMFA = useMemo(() => 
    azureState.users.filter(user => azureState.mfaEnabled.has(user.email))
  , [azureState.users, azureState.mfaEnabled]);

  return (
    <div>
      <ModernHeader 
        title="Multi-Factor Authentication" 
        subtitle="Protege las identidades con autenticación de múltiples factores"
        icon={Shield}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MFA por Usuario */}
        <ModernCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Habilitar MFA por Usuario</h3>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {usersList.map(user => (
              <label 
                key={user.id} 
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={user.isSelected}
                  onChange={() => toggleUser(user.email)}
                  className="w-5 h-5 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2"
                  aria-label={`Seleccionar ${user.firstName} ${user.lastName} para MFA`}
                />
                <div className="flex-1">
                  <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                  <span className="block text-sm text-gray-400">{user.email}</span>
                </div>
                {user.hasMFA && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>MFA Activo</span>
                  </div>
                )}
              </label>
            ))}
          </div>
          
          <div className="flex gap-3">
            <ModernButton 
              onClick={handleEnableMFA} 
              disabled={selectedUsers.length === 0}
              icon={Shield}
            >
              Habilitar MFA ({selectedUsers.length})
            </ModernButton>
            
            {selectedUsers.length > 0 && (
              <ModernButton
                onClick={() => handleDisableMFA(selectedUsers)}
                variant="secondary"
                icon={X}
              >
                Revocar MFA (selección)
              </ModernButton>
            )}
          </div>
        </ModernCard>

        {/* MFA por Grupo */}
        <ModernCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Habilitar MFA por Grupo</h3>
          </div>

          <select
            value={selectedGroupId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedGroupId(v === '' ? null : Number(v));
            }}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Seleccionar grupo para habilitar MFA"
          >
            <option value="">Seleccionar grupo...</option>
            {azureState.groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <ModernButton 
            onClick={handleEnableMFAForGroup} 
            disabled={selectedGroupId == null}
            icon={Award}
          >
            Habilitar MFA para Grupo
          </ModernButton>
        </ModernCard>
      </div>

      {/* Usuarios con MFA - Con opción de revocar */}
      {usersWithMFA.length > 0 && (
        <ModernCard className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Usuarios con MFA Activo</h3>
          </div>
          <div className="space-y-3">
            {usersWithMFA.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div>
                  <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                  <span className="block text-sm text-gray-400">{user.email}</span>
                </div>
                <ModernButton
                  onClick={() => handleDisableMFA([user.email])}
                  variant="danger"
                  icon={X}
                  className="py-2 px-4 text-sm"
                >
                  Revocar MFA
                </ModernButton>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Estadísticas MFA */}
      <ModernCard className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Estado MFA</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <p className="text-2xl font-bold text-green-400">{azureState.mfaEnabled.size}</p>
            <p className="text-gray-400">Usuarios Protegidos</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">{azureState.users.length}</p>
            <p className="text-gray-400">Usuarios Totales</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <p className="text-2xl font-bold text-purple-400">
              {azureState.users.length > 0 
                ? Math.round((azureState.mfaEnabled.size / azureState.users.length) * 100)
                : 0
              }%
            </p>
            <p className="text-gray-400">Cobertura MFA</p>
          </div>
        </div>
      </ModernCard>
    </div>
  );
});

// ✅ COMPONENTES MEJORADOS CON IMÁGENES Y MENSAJES AMIGABLES
const ConditionalAccessTab = memo(({ azureState, setAzureState, addNotification }) => (
  <div>
    <ModernHeader 
      title="Conditional Access" 
      subtitle="Define políticas de acceso condicional"
      icon={Zap}
    />
    <ModernCard className="text-center py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Zap className="w-16 h-16 text-yellow-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">🚧</span>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">Próximamente</h3>
          <p className="text-gray-300 max-w-md text-lg leading-relaxed">
            Estamos construyendo el módulo más avanzado de Conditional Access.<br />
            Pronto podrás crear políticas complejas con condiciones y controles.
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <ModernButton
            onClick={() => addNotification('¡El módulo MFA está listo para practicar! 🛡️')}
            variant="primary"
            icon={Shield}
          >
            Probar MFA
          </ModernButton>
          <ModernButton
            onClick={() => addNotification('Muy pronto tendrás acceso a Conditional Access ⚡')}
            variant="secondary"
          >
            Notificarme
          </ModernButton>
        </div>
      </div>
    </ModernCard>
  </div>
));

const PIMTab = memo(({ azureState, setAzureState, addNotification }) => (
  <div>
    <ModernHeader 
      title="Privileged Identity Management" 
      subtitle="Gestiona roles privilegiados con PIM"
      icon={Award}
    />
    <ModernCard className="text-center py-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Award className="w-16 h-16 text-yellow-400 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">⚙️</span>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">En Desarrollo</h3>
          <p className="text-gray-300 max-w-md text-lg leading-relaxed">
            Preparando la gestión de roles privilegiados.<br />
            Podrás asignar roles elegibles y activar permisos temporales.
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <ModernButton
            onClick={() => addNotification('Explora el módulo MFA completamente funcional! 🎯')}
            variant="primary"
            icon={Shield}
          >
            Ir a MFA
          </ModernButton>
          <ModernButton
            onClick={() => addNotification('PIM estará disponible en la próxima actualización 👑')}
            variant="secondary"
          >
            Más Información
          </ModernButton>
        </div>
      </div>
    </ModernCard>
  </div>
));

// ✅ COMPONENTE PRINCIPAL CON BRANDING PERSONALIZADO
const CloudNexusSimulator = () => {
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('mfa');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [azureState, setAzureState] = useState({
    users: [
      { id: 1, firstName: 'Ana', lastName: 'García', email: 'ana@empresa.com' },
      { id: 2, firstName: 'Carlos', lastName: 'López', email: 'carlos@empresa.com' },
      { id: 3, firstName: 'María', lastName: 'Rodríguez', email: 'maria@empresa.com' }
    ],
    groups: [
      { id: 1, name: 'Administradores', members: ['ana@empresa.com'] },
      { id: 2, name: 'Usuarios Estándar', members: ['carlos@empresa.com', 'maria@empresa.com'] }
    ],
    mfaEnabled: new Set(),
    policies: [],
    pimAssignments: []
  });

  const { notifications, addNotification, removeNotification } = useNotifications();

  // ✅ SISTEMA DE RETOS COMPLETO
  const startChallenge = useCallback((challengeId) => {
    const ch = challenges.find(c => c.id === challengeId);
    setCurrentChallenge(ch || null);
    addNotification(`Reto iniciado: ${ch?.title}`, 'success');
  }, [addNotification]);

  const verifyCurrentChallenge = useCallback(() => {
    if (!currentChallenge) return;
    const result = currentChallenge.verify(azureState);
    addNotification(result.message, result.success ? 'success' : 'error');
  }, [currentChallenge, azureState, addNotification]);

  const renderActiveComponent = () => {
    const props = { azureState, setAzureState, addNotification };
    
    switch (activeTab) {
      case 'mfa':
        return <MFATab {...props} />;
      case 'conditional-access':
        return <ConditionalAccessTab {...props} />;
      case 'pim':
        return <PIMTab {...props} />;
      default:
        return <MFATab {...props} />;
    }
  };

  // VISTA HOME CON BRANDING PERSONALIZADO
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            {/* ✅ LOGO PERSONALIZADO - ACTUALIZADO CON NEXUS.PNG */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <img 
                    src="/nexus.png" 
                    alt="CloudNexus Simulator" 
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg">☁️</span>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CloudNexus Simulator
            </h1>
            <p className="text-2xl text-gray-300 mb-4">Microsoft Identity and Access Administrator</p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Domina Azure AD/Entra ID con nuestro simulador interactivo. 
              Practica escenarios reales de seguridad e identidad en un entorno seguro.
            </p>
            <ModernButton 
              onClick={() => setCurrentView('simulator')}
              variant="primary"
              icon={Target}
              className="text-lg px-10 py-5 mb-8 transform hover:scale-110 transition-all duration-300"
            >
              🚀 Iniciar CloudNexus
            </ModernButton>

            {/* ✅ RETOS DISPONIBLES COMPLETOS */}
            <ModernCard className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">🎯 Retos Disponibles</h3>
                  <p className="text-gray-400">Completa estos desafíos para dominar MFA</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((ch, index) => (
                  <ModernButton
                    key={ch.id}
                    onClick={() => startChallenge(ch.id)}
                    variant="secondary"
                    className="text-sm justify-start text-left h-auto py-4 px-4 hover:scale-105 transition-transform"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-white">{ch.title}</span>
                      </div>
                      <span className="text-xs text-gray-300 text-left">{ch.instructions}</span>
                    </div>
                  </ModernButton>
                ))}
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    );
  }

  // VISTA SIMULADOR
  return (
    <>
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CloudNexus Simulator
              </h1>
              <p className="text-gray-400 mt-2">Practica configuraciones reales de Azure AD/Entra ID</p>
            </div>
            <ModernButton 
              onClick={() => setCurrentView('home')}
              variant="secondary"
              className="hover:scale-105 transition-transform"
            >
              ← Volver al Inicio
            </ModernButton>
          </div>

          {/* ✅ RETO ACTIVO MEJORADO */}
          {currentChallenge && (
            <ModernCard className="mb-6 border-2 border-yellow-400/30 bg-yellow-500/5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <Target className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-400 font-semibold">🎯 RETO ACTIVO</p>
                      <h3 className="text-lg font-bold text-white">{currentChallenge.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-1">{currentChallenge.instructions}</p>
                </div>
                <div className="flex gap-2">
                  <ModernButton onClick={verifyCurrentChallenge} variant="success" icon={CheckCircle}>
                    Verificar
                  </ModernButton>
                  <ModernButton onClick={() => setCurrentChallenge(null)} variant="secondary" icon={X}>
                    Cancelar
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          )}

          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderActiveComponent()}
        </div>
      </div>
    </>
  );
};

export default CloudNexusSimulator;
