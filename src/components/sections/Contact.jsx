import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, User } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/context/ToastContext';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', message: '' });
      toast.success('Message sent! We will get back to you soon.');
    }, 1200);
  };

  return (
    <section id="contact" className="bg-gray-50 py-16 lg:py-24 dark:bg-gray-900/40">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">Contact</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Get in touch
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Have a question about the system, a crop we should support, or want to collaborate? Send us a message.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <div className="space-y-4">
              <div className="card flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <Mail size={20} />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">hello@plantai.dev</p>
                </div>
              </div>
              <div className="card flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Remote · Worldwide</p>
                </div>
              </div>
              <div className="card flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <MessageSquare size={20} />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Response</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Within 24 hours</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us how we can help…"
                  className="input-field resize-none"
                />
              </div>
              <button type="submit" disabled={sending} className="btn-primary mt-6 w-full sm:w-auto">
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
