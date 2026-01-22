
// Copied from Amori for consistency
import { Square, Cat, Dog, Leaf } from 'lucide-react';

export const themes = {
    default: {
        id: 'default',
        label: 'Oscuro',
        icon: 'square',
        bg: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white",
        header: "bg-black/80 border-white/10",
        headerText: "text-white",
        card: "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300",
        cardTitle: "text-gray-300",
        highlight: "text-blue-400",
        titleGradient: "from-blue-400 to-pink-500",
        buttonPrimary: "bg-blue-500 hover:bg-blue-400 text-white",
        buttonSecondary: "bg-white/10 hover:bg-white/20 text-gray-400",
        input: "bg-black/20 border-white/10 text-gray-300",
        ringColor: "ring-white/50",
        activeBg: "bg-white/20"
    },
    kitten: {
        id: 'kitten',
        label: 'Gatitos',
        icon: 'cat',
        bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 text-rose-900",
        header: "bg-white/70 border-pink-200 shadow-sm",
        headerText: "text-rose-900",
        card: "bg-white/60 border-pink-200 hover:bg-white/90 text-rose-800 shadow-sm",
        cardTitle: "text-rose-700",
        highlight: "text-pink-500",
        titleGradient: "from-pink-400 to-rose-500",
        buttonPrimary: "bg-pink-400 hover:bg-pink-300 text-white",
        buttonSecondary: "bg-white/40 hover:bg-white/60 text-rose-400",
        input: "bg-white/50 border-pink-200 text-rose-800",
        ringColor: "ring-pink-300",
        activeBg: "bg-pink-100",
        customIcon: "/kitten-fan.png",
        backgroundImage: "/kitten-fan.png",
        bgRepeat: true
    },
    puppy: {
        id: 'puppy',
        label: 'Cowboy',
        icon: 'dog',
        bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 text-stone-800",
        header: "bg-white/70 border-amber-200 shadow-sm",
        headerText: "text-stone-800",
        card: "bg-white/60 border-amber-200 hover:bg-white/90 text-stone-700 shadow-sm",
        cardTitle: "text-stone-800",
        highlight: "text-amber-600",
        titleGradient: "from-amber-500 to-orange-600",
        buttonPrimary: "bg-amber-500 hover:bg-amber-400 text-white",
        buttonSecondary: "bg-white/40 hover:bg-white/60 text-stone-500",
        input: "bg-white/50 border-amber-200 text-stone-800",
        ringColor: "ring-amber-300",
        activeBg: "bg-amber-100",
        customIcon: "/kitten-cowboy.png",
        backgroundImage: "/kitten-cowboy.png",
        bgRepeat: true
    },
    nature: {
        id: 'nature',
        label: 'Nature',
        icon: 'leaf',
        bg: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-green-950 text-emerald-50', // Deep forest gradient
        header: 'bg-emerald-950/60 border-emerald-800/50 backdrop-blur-md shadow-lg shadow-emerald-900/20', // Glassmorphism header
        card: 'bg-emerald-900/40 border-emerald-700/30 hover:bg-emerald-800/50 hover:border-emerald-500/50 hover:shadow-emerald-900/30', // Glass cards
        text: 'text-emerald-100',
        headerText: 'text-emerald-50 drop-shadow-sm',
        buttonPrimary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/20', // Gradient buttons
        buttonSecondary: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/30',
        input: 'bg-emerald-950/50 border-emerald-700/50 text-emerald-100 placeholder-emerald-600/50 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50',
        highlight: 'text-emerald-300',
        ringColor: 'ring-emerald-400',
        player: 'bg-gradient-to-t from-emerald-950/95 to-emerald-900/90 border-t border-emerald-500/20 backdrop-blur-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]', // Premium player bar
        progressColor: 'bg-gradient-to-r from-emerald-400 to-teal-300',
        titleGradient: 'from-emerald-300 via-teal-200 to-green-300', // Shimmering title
        backgroundImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5d2294a?q=80&w=2000&auto=format&fit=crop', // Subtle fern/forest background
        bgRepeat: false // Cover
    }
};
