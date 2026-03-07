export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-primary-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-semibold text-care-text mb-2">{title}</h3>
      <p className="text-care-muted text-base leading-relaxed">{description}</p>
    </div>
  );
}
