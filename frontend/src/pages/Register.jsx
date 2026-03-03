import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Mail, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await register(email, password, name);
        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="flex h-[calc(100vh-140px)] items-center justify-center">
            <div className="w-full max-w-md space-y-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/40 dark:border-zinc-800/50">
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
                        Create Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        Join ExpenseTracker to manage your finances
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm text-center border border-red-100 dark:border-red-900/30 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 sm:text-sm sm:leading-6 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800 dark:focus:border-purple-500 dark:focus:ring-purple-500/20 transition-all duration-200 ease-in-out outline-none"
                                placeholder="Full Name (optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 sm:text-sm sm:leading-6 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800 dark:focus:border-purple-500 dark:focus:ring-purple-500/20 transition-all duration-200 ease-in-out outline-none"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 sm:text-sm sm:leading-6 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800 dark:focus:border-purple-500 dark:focus:ring-purple-500/20 transition-all duration-200 ease-in-out outline-none"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:from-indigo-500 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all duration-200 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    Register <UserPlus className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm mt-6">
                    <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
                    <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
