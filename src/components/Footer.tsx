export default function Footer() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Ar
        </div>
        <div className="flex items-center gap-6 text-xs text-text-muted">
          <a href="#projects" className="hover:text-text transition-colors">Projects</a>
          <a href="#experience" className="hover:text-text transition-colors">Experience</a>
          <a href="#stack" className="hover:text-text transition-colors">Stack</a>
          <a href="#contact" className="hover:text-text transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
