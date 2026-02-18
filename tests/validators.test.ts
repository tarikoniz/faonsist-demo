// ============================================
// FaOnSisT - Validator Tests
// ============================================

import { describe, it, expect } from 'vitest';

// Inline test — validators are Zod schemas, test their behavior
import { z } from 'zod';

// Reproduce key validators from lib/validators.ts
const emailSchema = z.string().trim().email('Gecerli e-posta giriniz').toLowerCase();
const passwordSchema = z.string().min(4, 'Sifre en az 4 karakter olmali');

describe('Email Validation', () => {
  it('Geçerli e-posta kabul eder', () => {
    expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    expect(emailSchema.parse('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('Geçersiz e-postayı reddeder', () => {
    expect(() => emailSchema.parse('notanemail')).toThrow();
    expect(() => emailSchema.parse('')).toThrow();
    expect(() => emailSchema.parse('a@')).toThrow();
  });

  it('Boşlukları temizler', () => {
    expect(emailSchema.parse('  test@example.com  ')).toBe('test@example.com');
  });
});

describe('Password Validation', () => {
  it('Yeterli uzunluk kabul eder', () => {
    expect(passwordSchema.parse('1234')).toBe('1234');
    expect(passwordSchema.parse('longpassword123')).toBe('longpassword123');
  });

  it('Kısa şifreyi reddeder', () => {
    expect(() => passwordSchema.parse('abc')).toThrow();
    expect(() => passwordSchema.parse('')).toThrow();
  });
});
