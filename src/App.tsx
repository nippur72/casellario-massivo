import { CasellarioMassivo } from "./pages/CasellarioMassivo";

export function App() {
    return (
        <div className="site-container">
            <header className="site-header">
                <h1 className="site-title">Ufficio Elettorale - Richiesta Massiva Casellario</h1>
            </header>
            <main className="site-body">
                <CasellarioMassivo />
            </main>
            <footer className="site-footer">
                Antonino Porcino (
                <a href="https://github.com/nippur72" target="_blank" rel="noopener noreferrer">nippur72</a>
                )
            </footer>
        </div>
    );
}
