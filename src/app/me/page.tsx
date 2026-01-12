import styles from './page.module.css';

export default function MePage() {
    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.avatar}>A</div>
                <h1 className={styles.name}>Alex "Nova" Chen</h1>
                <h2 className={styles.role}>Digital Architect & UI Artisan</h2>

                <p className={styles.bio}>
                    Building digital dreams at the intersection of logic and creativity.
                    Obsessed with pixel-perfect interfaces and seamless user experiences.
                    Currently exploring the frontiers of WebGL and generative art.
                </p>

                <div className={styles.skills}>
                    <span className={styles.skillTag}>React / Next.js</span>
                    <span className={styles.skillTag}>TypeScript</span>
                    <span className={styles.skillTag}>Three.js</span>
                    <span className={styles.skillTag}>Rust</span>
                    <span className={styles.skillTag}>UI/UX Design</span>
                </div>

                <div className={styles.socials}>
                    <a href="#" className={styles.link}>Twitter</a>
                    <a href="#" className={styles.link}>GitHub</a>
                    <a href="#" className={styles.link}>Dribbble</a>
                    <a href="#" className={styles.link}>Email</a>
                </div>
            </div>
        </main>
    );
}
