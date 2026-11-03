import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Container } from '../../components/layout/Container';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar mid />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white py-24 border-b border-slate-700">
          <Container maxWidth="2xl">
            <div className="text-center space-y-4 animate-page-enter">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
                Our Story
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-100">About Plastopol</h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Crafting quality seating solutions since inception — built on recycled plastics, built to last.
              </p>
            </div>
          </Container>
        </section>

        {/* Story */}
        <section className="py-20 bg-slate-800">
          <Container maxWidth="2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 animate-on-scroll">
                <h2 className="text-3xl font-bold text-slate-100">Who We Are</h2>
                <p className="text-slate-400 leading-relaxed">
                  Plastopol is a furniture manufacturer specialising in high-quality chairs made from recycled,
                  semi-virgin, and virgin plastic materials. We combine sustainable sourcing with rigorous
                  manufacturing to deliver seating that performs in offices, dining rooms, lounges, and outdoors.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Every chair we make is a commitment — to the environment, to our customers, and to the
                  craftspeople behind every mould and finish.
                </p>
              </div>
              <div className="bg-slate-700 border border-slate-600 rounded-2xl h-72 flex items-center justify-center animate-on-scroll">
                <span className="text-slate-500 text-sm">Factory / team photo</span>
              </div>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="py-20 bg-slate-900 border-t border-slate-700">
          <Container maxWidth="2xl">
            <h2 className="text-3xl font-bold text-slate-100 text-center mb-12 animate-on-scroll">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Sustainability',
                  body: 'We prioritise recycled plastics in our production, reducing landfill waste without compromising quality.',
                },
                {
                  title: 'Durability',
                  body: 'Our chairs are load-tested and weather-rated, built to withstand years of real-world use.',
                },
                {
                  title: 'Transparency',
                  body: 'We are upfront about materials, lead times, and sourcing — no surprises after the order.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-8 hover:shadow-lg hover:shadow-indigo-900/20 transition-all animate-on-scroll">
                  <h3 className="text-xl font-semibold text-slate-100 mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Location */}
        <section className="py-20 bg-slate-800 border-t border-slate-700">
          <Container maxWidth="2xl">
            <h2 className="text-3xl font-bold text-slate-100 mb-8 animate-on-scroll">Find Us</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-600 h-96 w-full animate-on-scroll">
              {
                <iframe
                  title='Map-location'
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31333.702215345376!2d76.09879095147106!3d10.985038828972382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7cb828b425279%3A0x965e2bcda06ba45!2sPlastopol!5e0!3m2!1sen!2sin!4v1775977316505!5m2!1sen!2sin"
                  width="1300"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              }
            </div>
          </Container>
        </section>

        {/* Contact nudge */}
        <section className="py-16 bg-slate-900 border-t border-slate-700">
          <Container maxWidth="2xl">
            <div className="text-center space-y-4 animate-on-scroll">
              <h2 className="text-3xl font-bold text-slate-100">Get in Touch</h2>
              <p className="text-slate-400">
                Interested in bulk orders, custom colours, or have a question? We would love to hear from you.
              </p>
              <p className="font-medium text-indigo-400">
                <a href="mailto:plastopoly.enquire@gmail.com" className="hover:text-indigo-300 transition">
                  plastopoly@gmail.com
                </a><br />
                <a href="tel:+91 8075767580" className="hover:text-indigo-300 transition">
                  +91 8075767580
                </a>
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
