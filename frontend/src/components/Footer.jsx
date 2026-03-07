import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-primary-100 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <span className="text-lg font-bold text-primary-700">CareCall</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-care-muted">
            <Link to="/" className="hover:text-primary-600 no-underline text-care-muted">Home</Link>
            <a href="#features" className="hover:text-primary-600 no-underline text-care-muted">Features</a>
            <Link to="/login" className="hover:text-primary-600 no-underline text-care-muted">Log In</Link>
            <Link to="/signup" className="hover:text-primary-600 no-underline text-care-muted">Sign Up</Link>
          </div>
          <p className="text-sm text-care-muted">
            © 2026 CareCall. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
