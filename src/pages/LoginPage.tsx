import React, { useState } from 'react';
import { GetMe, Login } from '../services/APIservice';
import { useAppDispatch } from '../store/hooks';
import { login, setMe } from '../store/authSlice';
import type { MeModel } from '../Models/AuthModel';

const LoginPage = () => {
	const dispatch = useAppDispatch();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const validateFields = () => {
		let valid = true;
		setUsernameError(null);
		setPasswordError(null);

		if (username.trim() === '') {
			setUsernameError('Kérlek add meg a felhasználóneved.');
			valid = false;
		}

		if (password.trim() === '') {
			setPasswordError('Kérlek add meg a jelszavad.');
			valid = false;
		}
		if (
			username.trim() !== '' &&
			username.split('.').length < 2 &&
			username !== 'teszt'
		) {
			setUsernameError(
				'A felhasználónév formátuma: vezetéknév.keresztnév pl: gipsz.jakab',
			);
			valid = false;
		}

		return valid;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (!validateFields()) {
			return;
		}
		setLoading(true);
		try {
			const token = await Login({ username, password }, rememberMe);
			if (token) {
				dispatch(login({ token }));
				const user: MeModel = await GetMe();
				dispatch(setMe({ me: user }));
			}
		} catch (err: unknown) {
			console.error('Login failed:', err);
			const maybeAxiosError = err as {
				response?: { status?: number };
				code?: string;
				message?: string;
			};
			const status = maybeAxiosError?.response?.status;

			if (
				status === 400 ||
				status === 401 ||
				status === 403 ||
				status === 422
			) {
				setError('Hibás felhasználónév vagy jelszó.');
			} else if (
				maybeAxiosError?.code === 'ERR_NETWORK' ||
				(err instanceof TypeError && err.message.includes('Failed to fetch'))
			) {
				setError(
					'Nem sikerült csatlakozni a szerverhez. Ellenőrizd az internetkapcsolatot vagy próbáld újra később.',
				);
			} else {
				setError('Szerverhiba történt. Kérlek próbáld újra később.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='w-screen min-h-screen bg-slate-50 dark:bg-primary flex items-center justify-center overflow-y-auto relative'>
			<div className='absolute inset-0 z-0 w-full h-full'>
				<div
					className='w-full h-full bg-center bg-cover bg-no-repeat'
					style={{
						backgroundImage:
							'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJoQ2rjfpMPOmwVk-d-ZlmY173WISPfBQ5Jj80DO8Mv3h2QvK0TBZTG0_X-86GcGWw62gnVPc3Zw51JDgUHjXYalGR_IDUnFQZBPYB55ncZp0wDkbbouesWinamYEkRaT64UEXzxfuI2G6sgn2NhnottgDt1kcPF4N6jJIEVebJIxyGpjKb-aAbznYotB3y9BjJKdek1NMfXJ6-PTyVi0ZxTkX2B5fgn1_6pNfGjEUwusd5FqXszXduc_jtMcPFzLsaRYoeSKsXTts")',
					}}></div>
				<div className='absolute inset-0 bg-black/30'></div>
			</div>

			<div className='relative z-10 w-full max-w-md px-4 py-6 sm:max-w-lg sm:px-6 sm:py-8 lg:max-w-5xl lg:scale-[1.5] lg:origin-center'>
				<div className='backdrop-blur-lg bg-surface-overlay/10 dark:bg-black/10 rounded-xl p-5 sm:p-6 shadow-2xl border border-white/20'>
					<div className='text-center mb-8'>
						<div className='w-16 h-16 rounded-lg bg-primary flex items-center justify-center shadow-lg mb-4 mx-auto'>
							<span className='material-symbols-outlined text-white text-4xl'>
								restaurant
							</span>
						</div>
						<h1 className='text-3xl font-bold text-primary dark:text-white mb-2'>
							Jedlik Büfé
						</h1>
						<p className='text-slate-400'>Töltsd fel magad a tanuláshoz.</p>
					</div>
					{error && (
						<div className='rounded-lg mb-4 p-3 bg-error/10 text-error-text border border-error/20 text-sm font-semibold'>
							{error}
						</div>
					)}
					<form
						className='space-y-5'
						onSubmit={handleSubmit}>
						<div>
							<label className='block text-sm text-slate-200 mb-2'>
								Jedlikes bejelentkezés
							</label>
							<div className='relative'>
								<img
									src='./profile.svg'
									className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white'
									alt='profile'
								/>
								<input
									type='text'
									placeholder='vezetéknév.keresztnév'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									className={
										'w-full pl-10 pr-4 py-3 rounded-lg border bg-white/30 text-slate-200 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all ' +
										(usernameError
											? 'border-red-400 focus:ring-red-400/40'
											: 'border-slate-300/50')
									}
								/>
							</div>
							{usernameError && (
								<p className='mt-1 text-xs font-medium text-red-300'>
									{usernameError}
								</p>
							)}
						</div>

						<div>
							<div className='flex justify-between items-center mb-2'>
								<label className='block text-sm text-slate-200'>Jelszó</label>
							</div>
							<div className='relative'>
								<img
									src='./lock.svg'
									className='w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2'
									alt='lock'
								/>
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder='••••••••'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className={
										'w-full pl-10 pr-10 py-3 rounded-lg border bg-white/30 text-slate-200 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all ' +
										(passwordError
											? 'border-red-400 focus:ring-red-400/40'
											: 'border-slate-300/50')
									}
								/>
								<img
									src={showPassword ? './showpwd.svg' : './hidepwd.svg'}
									onClick={() => setShowPassword(!showPassword)}
									className='w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
									alt='toggle password'
								/>
							</div>
							{passwordError && (
								<p className='mt-1 text-xs font-medium text-red-300'>
									{passwordError}
								</p>
							)}
						</div>
						{/* <div className="flex items-center">
                            <label className="flex items-center cursor-pointer relative" htmlFor="check-2">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800" id="check-2" />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                                        stroke="currentColor" strokeWidth={1}>
                                        <path fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"></path>
                                    </svg>
                                </span>
                            </label>
                            <label className="cursor-pointer ml-2 text-slate-200 text-sm leading-5" htmlFor="check-2">
                                Emlékezz rám
                            </label>
                        </div> */}
						<button
							type='submit'
							disabled={loading}
							className='w-full bg-primary hover:bg-primary-strong disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-95 mt-4'>
							{loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
						</button>
					</form>
				</div>

				<div className='text-center mt-8 text-slate-600 dark:text-slate-400'>
					<div className='flex justify-center gap-6 text-xs uppercase tracking-widest text-slate-400 dark:text-slate-400'>
						<a
							target='_blank'
							href='https://gyor-jedlik.cms.intezmeny.edir.hu/uploads/GYSZC_Jedlik_Anyos_Technikum_GDPR_Adatkezelesi_es_adatvedelmi_szabalyzat_hatalyos_2022_01_01_tol_fca5c07ebb.pdf'
							className='hover:text-slate-300 text-white'>
							Adatkezelés
						</a>
						<h1 className='text-white'>
							{new Date().getFullYear()} BKM - Jedlik
						</h1>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
