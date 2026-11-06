'use client';

import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Contact MyMall Support
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300">
          Have questions about store onboarding, subscription billing, or order delivery? We are here to help 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              <span>Headquarters</span>
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Bole Medhanialem Mall, 2nd Floor
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Addis Ababa, Ethiopia
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              <span>Direct Phone & Telebirr</span>
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              +251-91-1234567
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mon – Sat: 08:30 – 19:30 (EAT)
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-500" />
              <span>Email Support</span>
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              support@mymall.et
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Replies usually within 2 to 4 business hours.
            </p>
          </div>

          {/* Payment Questions Banner */}
          <div className="p-6 rounded-3xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-500/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-700 dark:text-brand-300">
              <CreditCard className="w-4 h-4 text-brand-500" />
              <span>Payment Confirmation Inquiries</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              When submitting manual bank transfer slips (CBE, Telebirr, Abyssinia), please make sure your Order Number or Store Name is visible on the receipt.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Send us a Message
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Fill out the form below and our team will get back to you promptly.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Message Sent Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Thank you for reaching out. A representative has received your ticket and will follow up with you shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <Input
                label="Subject or Store Name"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding store onboarding or POS integration"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Message Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none font-sans"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
