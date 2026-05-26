import { useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc } from 'firebase/firestore';

const CANDIDATES = [
    // Oficialistas
    { id: 'c1', name: 'Candidato Oficialista 1', party: 'oficialista', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 'c2', name: 'Candidato Oficialista 2', party: 'oficialista', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 'c3', name: 'Candidato Oficialista 3', party: 'oficialista', photo: 'https://i.pravatar.cc/150?u=3' },
    { id: 'c4', name: 'Candidato Oficialista 4', party: 'oficialista', photo: 'https://i.pravatar.cc/150?u=4' },
    // Opositores
    { id: 'c5', name: 'Candidato Opositor 1', party: 'opositor', photo: 'https://i.pravatar.cc/150?u=5' },
    { id: 'c6', name: 'Candidato Opositor 2', party: 'opositor', photo: 'https://i.pravatar.cc/150?u=6' },
    { id: 'c7', name: 'Candidato Opositor 3', party: 'opositor', photo: 'https://i.pravatar.cc/150?u=7' },
    { id: 'c8', name: 'Candidato Opositor 4', party: 'opositor', photo: 'https://i.pravatar.cc/150?u=8' },
];

const STORAGE_KEY_USER = 'ei_poll_user_votes';

export default function CandidatePoll() {
    const [votes, setVotes] = useState({});
    const [userVotes, setUserVotes] = useState({ oficialista: false, opositor: false });

    useEffect(() => {
        // 1. Suscribirse a los votos en Firestore en tiempo real
        const pollDocRef = doc(db, 'polls', 'hermosillo2026');
        const unsubscribe = onSnapshot(pollDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setVotes(docSnapshot.data());
            } else {
                // Si el documento no existe en Firestore, inicializarlo con votos aleatorios
                const initial = {};
                CANDIDATES.forEach(c => initial[c.id] = Math.floor(Math.random() * 50) + 10);
                setVotes(initial);
                setDoc(pollDocRef, initial);
            }
        }, (error) => {
            console.error("Error al suscribirse a los votos en Firestore:", error);
        });

        // 2. Cargar historial de votos del usuario local (para restricción de 1 voto por alianza)
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY_USER);
            if (storedUser) {
                setUserVotes(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Error al cargar datos del usuario local:", e);
        }

        return () => unsubscribe();
    }, []);

    const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0) || 1; // Evitar división por 0

    const handleVote = async (candidate) => {
        // Validar si ya votó por esta alianza
        if (userVotes[candidate.party]) {
            alert(`Ya has registrado tu voto por la alianza ${candidate.party}.`);
            return;
        }

        // Actualizar estado del usuario en local para restringir nuevos votos
        const newUserVotes = { ...userVotes, [candidate.party]: true };
        setUserVotes(newUserVotes);
        try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUserVotes));
        } catch (e) {
            console.error("Error guardando el voto del usuario local:", e);
        }

        // Incrementar el voto de forma atómica en Firestore
        try {
            const pollDocRef = doc(db, 'polls', 'hermosillo2026');
            await updateDoc(pollDocRef, {
                [candidate.id]: increment(1)
            });
        } catch (error) {
            console.error("Error al registrar el voto en Firestore:", error);
            alert("Hubo un problema al registrar tu voto en la nube. Por favor intenta de nuevo.");
            
            // Revertir estado local en caso de error
            const revertedUserVotes = { ...userVotes, [candidate.party]: false };
            setUserVotes(revertedUserVotes);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(revertedUserVotes));
        }
    };

    return (
        <div className="bg-card rounded-2xl p-6 shadow-md border border-border/50 mb-6">
            <div className="mb-4 text-center">
                <h3 className="text-xl font-black text-text-primary uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                    Elecciones Hermosillo
                </h3>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                    Simulación de Voto 2026
                </p>
            </div>

            <div className="space-y-4">
                {CANDIDATES.map(candidate => {
                    const candidateVotes = votes[candidate.id] || 0;
                    const percentage = ((candidateVotes / totalVotes) * 100).toFixed(1);
                    const hasVotedThisParty = userVotes[candidate.party];

                    return (
                        <div key={candidate.id} className="relative bg-surface rounded-xl p-3 flex items-center gap-4 overflow-hidden border border-border/30 group">
                            {/* Barra de progreso de fondo */}
                            <div 
                                className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-1000 ${candidate.party === 'oficialista' ? 'bg-accent' : 'bg-blue-600'}`}
                                style={{ width: `${percentage}%` }}
                            />

                            <img 
                                src={candidate.photo} 
                                alt={candidate.name} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm relative z-10"
                            />
                            
                            <div className="flex-1 relative z-10">
                                <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                                    {candidate.name}
                                </h4>
                                <div className="flex justify-between items-center text-xs mt-1">
                                    <span className={`font-semibold ${candidate.party === 'oficialista' ? 'text-accent' : 'text-blue-600'} uppercase text-[10px] tracking-wider`}>
                                        {candidate.party}
                                    </span>
                                    <span className="font-bold text-text-secondary">
                                        {percentage}% <span className="text-text-muted font-normal">({candidateVotes})</span>
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleVote(candidate)}
                                disabled={hasVotedThisParty}
                                className={`relative z-10 shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                                    hasVotedThisParty 
                                        ? 'bg-border/50 text-text-muted cursor-not-allowed' 
                                        : 'bg-navy text-white hover:bg-accent hover:scale-110 shadow-md'
                                }`}
                                title={hasVotedThisParty ? "Ya votaste en esta alianza" : "Votar"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-4 text-center text-xs text-text-muted">
                {userVotes.oficialista && userVotes.opositor ? (
                    <span className="text-green-600 font-bold">¡Gracias por participar! Has usado todos tus votos.</span>
                ) : (
                    <span>Regla: Máximo 1 voto por alianza.</span>
                )}
            </div>
        </div>
    );
}
