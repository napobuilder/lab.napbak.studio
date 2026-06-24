import React, { useState, useEffect } from 'react';
import { 
  Music, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Lock,
  Link as LinkIcon,
  PlayCircle,
  Info,
  ShieldCheck
} from 'lucide-react';

// ============================================================================
// 🛠️ ÁREA DE GESTIÓN (TÚ ACTUALIZAS ESTO CADA MES) 🛠️
// ============================================================================
const CREDENCIALES = {
  usuario: 'freddy',
  clave: 'tusasong2026'
};

const DATOS_DEL_CLIENTE = {
  nombreArtista: "Tusasong",
  mesActual: "Mayo 2026",
  // Logo personalizado
  logoEmpresa: "https://i.imgur.com/qoWWaHa.png",
  
  albumDetalle: {
    portada: "https://distrokid.imgix.net/http%3A%2F%2Fgather.fandalism.com%2F9918696--3EADE400-99EA-4E66-BF4A1C0651861C1A--0--219185--1900x19000000008000.jpg?fm=jpg&q=75&w=800&s=67321f88f985c0db8fbf27f9aff651e4",
    titulo: "Música para la Gastronomía Andina (Remastered)",
    artista: "Balance Humano presenta a Tusasong",
    sello: "Balance Humano",
    upc: "825293202685",
    distribuidora: "DistroKid",
    fechaSubida: "6 de mayo de 2026",
    hyperfollow: "https://open.spotify.com/intl-es/album/473lN9eSynOBPEVidAmFcu",
    spotify: "https://open.spotify.com/intl-es/album/473lN9eSynOBPEVidAmFcu"
  },
  
  // ESTADO DEL LANZAMIENTO (Progreso visual)
  // Cambia el "pasoActual" de 1 a 4 según avance el proceso.
  // 1: Subido | 2: Revisado | 3: Enviando a Tiendas | 4: ¡En Spotify!
  pasoActual: 4, 

  // NUEVO: BITÁCORA DE GESTIÓN (Tus acciones como manager para justificar el pago)
  bitacora: [
    { 
      id: 0,
      fecha: "10 May 2026", 
      titulo: "Lanzamiento oficial en Spotify",
      descripcion: "El álbum ya se encuentra disponible y sincronizado en la plataforma de Spotify con todos los metadatos correctos.",
      estado: "Completado" 
    },
    { 
      id: 1,
      fecha: "06 May 2026", 
      titulo: "Monitoreo de transferencia",
      descripcion: "Auditoría del envío de metadatos (ISRC) hacia servidores de Spotify y Apple Music.",
      estado: "Completado" 
    },
    { 
      id: 2,
      fecha: "04 May 2026", 
      titulo: "Gestión de soporte internacional",
      descripcion: "Resolución de disputa de re-subida y aprobación manual del máster con el equipo de distribución.",
      estado: "Completado" 
    },
    { 
      id: 3,
      fecha: "28 Abr 2026", 
      titulo: "Revisión de catálogo",
      descripcion: "Sincronización de letras y créditos para las 15 pistas del álbum.",
      estado: "Completado" 
    },
    { 
      id: 4,
      fecha: "15 Ene 2026", 
      titulo: "Edición y Remasterización",
      descripcion: "Ajuste de finales en 15 pistas y remasterización para cumplir normas de distribución y asegurar un lanzamiento único.",
      estado: "Completado" 
    }
  ],

  canciones: [
    { num: 1, titulo: "El camión de los gochos" },
    { num: 2, titulo: "La esquina dela mor" },
    { num: 3, titulo: "El pan tachirense" },
    { num: 4, titulo: "De Motatán a Caracas (feat. María Laura Sánchez)" },
    { num: 5, titulo: "Mojito trujillano" },
    { num: 6, titulo: "Dulce dama andina" },
    { num: 7, titulo: "Golpes tachirenses" },
    { num: 8, titulo: "Abrillantado amor (feat. Regulo Castellanos)" },
    { num: 9, titulo: "Mistela merideña" },
    { num: 10, titulo: "Amable pisca andina" },
    { num: 11, titulo: "Tatuy añorado" },
    { num: 12, titulo: "Siete potajes" },
    { num: 13, titulo: "Desayuno en Tariba" },
    { num: 14, titulo: "Amores achocolatados" },
    { num: 15, titulo: "Un Abrillantado Amor (feat. José Manuel Rios & Julio Andrade)" }
  ]
};
// ============================================================================

export default function TusasongDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Prevenir indexación y cambiar título
  useEffect(() => {
    document.title = "Panel de Gestión | Tusasong";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = "robots";
      metaRobots.content = "noindex, nofollow";
      document.head.appendChild(metaRobots);
    } else {
      metaRobots.content = "noindex, nofollow";
    }

    return () => {
      document.title = "Napbak Studio";
      if (metaRobots) {
        metaRobots.content = "index, follow"; // Restore on unmount if needed
      }
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === CREDENCIALES.usuario && password === CREDENCIALES.clave) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciales incorrectas. Por favor intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // --- PANTALLA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#121212] rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            
            {/* LOGO COLORIZADO CON CSS (Cero círculos de fondo, solo la silueta en Amarillo Oro) */}
            <div 
              className="w-20 h-20 bg-yellow-400 mb-5 hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.15)]"
              style={{
                WebkitMaskImage: `url(${DATOS_DEL_CLIENTE.logoEmpresa})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${DATOS_DEL_CLIENTE.logoEmpresa})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />

            <h1 className="text-2xl font-bold text-white tracking-wider">NAPBAK<span className="font-light text-gray-400">STUDIO</span></h1>
            <p className="text-sm text-gray-400 mt-2 text-center">Panel de Control para Artistas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-4 text-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-4 top-4 w-6 h-6 text-gray-500" />
              </div>
            </div>
            
            {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-lg border border-red-500/20">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-white text-black text-lg font-bold rounded-lg px-4 py-4 hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-200 mt-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              Entrar a mi perfil
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-800 pt-6">
            <p>Servicio gestionado por <strong>Aloha Digital</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 pb-20">
      
      {/* Navegación Superior */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            
            {/* LOGO EN NAVBAR COLORIZADO */}
            <div 
              className="w-8 h-8 bg-yellow-400"
              style={{
                WebkitMaskImage: `url(${DATOS_DEL_CLIENTE.logoEmpresa})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${DATOS_DEL_CLIENTE.logoEmpresa})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />

            <span className="font-bold text-lg tracking-wider hidden sm:block">NAPBAK<span className="font-light text-gray-400">STUDIO</span></span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-base font-bold text-white">{DATOS_DEL_CLIENTE.nombreArtista}</p>
              <p className="text-sm text-green-400 flex items-center justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                En línea
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] p-2 rounded-lg border border-gray-800 hover:border-gray-600"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal (Más estrecho para facilitar lectura) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Estado de tu Música</h2>
          <p className="text-lg text-gray-400">Aquí puedes revisar el progreso de tu último lanzamiento.</p>
        </div>

        {/* Tarjeta Principal del Álbum */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row">
            
            {/* Columna Izquierda: Portada */}
            <div className="w-full md:w-2/5 bg-black p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
              <img 
                src={DATOS_DEL_CLIENTE.albumDetalle.portada} 
                alt="Portada del Álbum" 
                className="w-full max-w-[280px] aspect-square object-cover rounded-lg shadow-xl shadow-yellow-900/10 border border-gray-800 mb-6"
              />
              <a 
                href={DATOS_DEL_CLIENTE.albumDetalle.spotify}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full bg-[#1DB954] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#1ed760] transition-colors shadow-lg shadow-[#1DB954]/20 hover:scale-[1.02] transform duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.9c.54.3.66.9.301 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Escuchar álbum en Spotify
              </a>
            </div>

            {/* Columna Derecha: Detalles y Estado */}
            <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-center">
              <div className="mb-8">
                <span className="inline-block bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full mb-3">
                  Lanzamiento Actual
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                  {DATOS_DEL_CLIENTE.albumDetalle.titulo}
                </h3>
                <p className="text-lg text-gray-400 mb-1">{DATOS_DEL_CLIENTE.albumDetalle.artista}</p>
                <p className="text-sm text-gray-500 font-mono mt-4">UPC: {DATOS_DEL_CLIENTE.albumDetalle.upc} | Vía: {DATOS_DEL_CLIENTE.albumDetalle.distribuidora}</p>
              </div>

              {/* Barra de Progreso Visual */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
                <h4 className="text-base font-bold mb-4 flex items-center text-white">
                  <PlayCircle className="w-5 h-5 mr-2 text-green-400" />
                  Progreso hacia Spotify y tiendas
                </h4>
                
                <div className="space-y-4">
                  {/* Paso 1 */}
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${DATOS_DEL_CLIENTE.pasoActual >= 1 ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                        {DATOS_DEL_CLIENTE.pasoActual > 1 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">1</span>}
                      </div>
                      <div className={`w-0.5 h-6 ${DATOS_DEL_CLIENTE.pasoActual >= 2 ? 'bg-green-500' : 'bg-gray-800'} mt-1`}></div>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${DATOS_DEL_CLIENTE.pasoActual >= 1 ? 'text-white' : 'text-gray-500'}`}>Subido a DistroKid</p>
                      <p className="text-sm text-gray-500">Archivos de audio y portada recibidos en el servidor.</p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${DATOS_DEL_CLIENTE.pasoActual >= 2 ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                        {DATOS_DEL_CLIENTE.pasoActual > 2 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">2</span>}
                      </div>
                      <div className={`w-0.5 h-6 ${DATOS_DEL_CLIENTE.pasoActual >= 3 ? 'bg-green-500' : 'bg-gray-800'} mt-1`}></div>
                    </div>
                    <div>
                      <p className={`text-base font-bold ${DATOS_DEL_CLIENTE.pasoActual >= 2 ? 'text-white' : 'text-gray-500'}`}>Aprobado por el sello</p>
                      <p className="text-sm text-gray-500">Todo el registro de derechos está correcto.</p>
                    </div>
                  </div>

                  {/* Paso 3 (El estado actual según las imágenes) */}
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${DATOS_DEL_CLIENTE.pasoActual >= 3 ? (DATOS_DEL_CLIENTE.pasoActual === 3 ? 'bg-yellow-500 text-black animate-pulse' : 'bg-green-500 text-black') : 'bg-gray-800 text-gray-500'}`}>
                        {DATOS_DEL_CLIENTE.pasoActual > 3 ? <CheckCircle2 className="w-4 h-4" /> : (DATOS_DEL_CLIENTE.pasoActual === 3 ? <Clock className="w-4 h-4" /> : <span className="text-xs font-bold">3</span>)}
                      </div>
                      <div className={`w-0.5 h-6 ${DATOS_DEL_CLIENTE.pasoActual >= 4 ? 'bg-green-500' : 'bg-gray-800'} mt-1`}></div>
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-base font-bold ${DATOS_DEL_CLIENTE.pasoActual >= 3 ? (DATOS_DEL_CLIENTE.pasoActual === 3 ? 'text-yellow-400' : 'text-white') : 'text-gray-500'}`}>
                        Transfiriendo a tiendas
                      </p>
                      {DATOS_DEL_CLIENTE.pasoActual === 3 && (
                        <p className="text-sm text-yellow-500/80 mt-1">
                          Tu música está viajando hacia Spotify, Apple Music y otras tiendas. Esto toma unos pocos días.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Paso 4 */}
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${DATOS_DEL_CLIENTE.pasoActual >= 4 ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-800 text-gray-500'}`}>
                        {DATOS_DEL_CLIENTE.pasoActual >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">4</span>}
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-base font-bold ${DATOS_DEL_CLIENTE.pasoActual >= 4 ? 'text-green-400' : 'text-gray-500'}`}>¡Disponible en Spotify y más!</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Lista de Canciones (AHORA ESTÁ ARRIBA DEL REGISTRO DE OPERACIONES) */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
              <Music className="w-6 h-6 mr-3 text-yellow-400" />
              Lista de Canciones ({DATOS_DEL_CLIENTE.canciones.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {DATOS_DEL_CLIENTE.canciones.map((track) => (
              <div key={track.num} className="p-4 rounded-xl bg-[#1a1a1a] border border-gray-800 hover:bg-[#222] transition-colors flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                  {track.num}
                </div>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-medium text-white">{track.titulo}</p>
                </div>
                <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                   <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Letras
                   </span>
                   <span className="flex items-center text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Créditos
                   </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gray-800/30 rounded-xl flex items-start">
            <Info className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Tus letras y créditos han sido sincronizados correctamente. Aparecerán en plataformas compatibles poco después del lanzamiento de tu música a través de DistroKid.
            </p>
          </div>
        </div>

        {/* NUEVA SECCIÓN: Bitácora de Gestión (MOVIDA AL FINAL) */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4 relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-yellow-400" />
              Registro de Operaciones
            </h3>
          </div>

          <div className="space-y-4 relative z-10">
            {DATOS_DEL_CLIENTE.bitacora.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-[#1a1a1a] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-gray-500">{item.fecha}</span>
                    <h4 className="text-base font-bold text-white">{item.titulo}</h4>
                  </div>
                  <p className="text-sm text-gray-400">{item.descripcion}</p>
                </div>
                <div className="flex-shrink-0">
                  {item.estado === "Completado" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Clock className="w-3 h-3 mr-1 animate-spin-slow" /> En proceso
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-5 text-center relative z-10">
            Registro de las gestiones técnicas, de masterización y distribución realizadas por el equipo de Napbak Studio.
          </p>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-8 text-center text-sm text-gray-500">
        <p className="font-bold text-gray-400 mb-1">Napbak Studio</p>
        <p>Distribución oficial impulsada por <strong>DistroKid</strong>. Gestión exclusiva de catálogo por Napbak Studio.</p>
        <p className="mt-4 text-xs opacity-50">Powered by Aloha Digital - Maracay, 2026</p>
      </footer>
    </div>
  );
}
