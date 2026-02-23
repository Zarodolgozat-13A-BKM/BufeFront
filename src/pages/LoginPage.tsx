import React, { useState } from 'react'
import { Login } from '../services/APIservice'

const LoginPage = () => {
    const [studentId, setStudentId] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    React.useEffect(() => {
        // Add styles to head
        const style = document.createElement('style')
        style.textContent = `
            body {
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            .blur-bg-overlay {
                backdrop-filter: blur(8px);
                background-color: rgba(248, 247, 246, 0.85);
            }
            .bg-orange {
                background-color: #ee8c2b;
            }
            .text-orange {
                color: #ee8c2b;
            }
            .border-orange {
                border-color: #ee8c2b;
            }
            .ring-orange {
                --tw-ring-color: #ee8c2b;
            }
            .focus\\:ring-orange:focus {
                --tw-ring-color: #ee8c2b;
            }
        `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            if(studentId.trim() === '' || password.trim() === '') {
                setError('Kérem, töltse ki az összes mezőt.')
                return;
            }
            if(studentId.split('.').length < 2) {
                console.log("a")
                setError('Kérem, adja meg a teljes Jedlikes azonosítóját (pl. Gipsz.Jakab).')
                return;
            }
            await Login({ studentId, password })
        } catch (err: any) {
            console.error('Login failed:', err)
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError('Nem sikerült csatlakozni a szerverhez. Ellenőrizd az internetkapcsolatot vagy próbáld újra később.');
            } else {
                setError('Hibás bejelentkezési adatok vagy szerverhiba.');
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-screen h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 z-0 w-full h-full">
                <div
                    className="w-full h-full bg-center bg-cover bg-no-repeat"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJoQ2rjfpMPOmwVk-d-ZlmY173WISPfBQ5Jj80DO8Mv3h2QvK0TBZTG0_X-86GcGWw62gnVPc3Zw51JDgUHjXYalGR_IDUnFQZBPYB55ncZp0wDkbbouesWinamYEkRaT64UEXzxfuI2G6sgn2NhnottgDt1kcPF4N6jJIEVebJIxyGpjKb-aAbznYotB3y9BjJKdek1NMfXJ6-PTyVi0ZxTkX2B5fgn1_6pNfGjEUwusd5FqXszXduc_jtMcPFzLsaRYoeSKsXTts")' }}
                >
                </div>
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 py-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg mb-4 mx-auto" style={{ backgroundColor: '#ee8c2b' }}>
                        <span className="material-symbols-outlined text-white text-4xl">restaurant</span>
                    </div>
                    <h1 className="text-3xl font-bold dark:text-white mb-2" style={{ color: '#ee8c2b' }}>Jedlik Bufé</h1>
                    <p className="text-slate-600 dark:text-slate-400">Fuel your study sessions.</p>
                </div>

                <div className="blur-bg-overlay dark:bg-slate-900/80 rounded-xl p-6 shadow-2xl border border-white/20">
                    <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Üdv újra!</h2>
                    {error && (
                        <div className="rounded-lg mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-sm">
                            {error}
                        </div>
                    )}
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jedlikes bejelentkezés</label>
                            <div className="relative">
                                <img src='./profile.svg' className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" alt="profile" />
                                <input
                                    type="text"
                                    placeholder="vezetéknév.keresztnév"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                                    style={{ outlineColor: '#ee8c2b', borderColor: 'rgb(226, 232, 240)', '--tw-ring-color': '#ee8c2b' } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Jelszó</label>
                                <a href="#" className="text-xs font-bold hover:underline" style={{ color: '#ee8c2b' }}>Elfelejtett jelszó?</a>
                            </div>
                            <div className="relative">
                                <img src='./lock.svg' className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" alt="lock" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                                    style={{ outlineColor: '#ee8c2b', '--tw-ring-color': '#ee8c2b' } as React.CSSProperties}
                                />
                                    <img src={showPassword ? "./showpwd.svg" : "./hidepwd.svg"} onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" alt="toggle password" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-95 mt-4"
                            style={{
                                backgroundColor: loading ? 'rgba(238, 140, 43, 0.5)' : '#ee8c2b',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-center gap-6 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500">
                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Adatvédelem</a>
                        <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Szerződési feltételek</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage