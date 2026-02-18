// ============================================
// FaOnSisT - Security Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Güvenlik Kontrolleri', () => {
  it('.env dosyası .gitignore içinde olmalı', () => {
    const gitignore = readFileSync(resolve(__dirname, '../.gitignore'), 'utf-8');
    expect(gitignore).toContain('.env');
  });

  it('node_modules .gitignore içinde olmalı', () => {
    const gitignore = readFileSync(resolve(__dirname, '../.gitignore'), 'utf-8');
    expect(gitignore).toContain('node_modules');
  });

  it('.env.example hassas veri içermemeli', () => {
    const envExample = readFileSync(resolve(__dirname, '../.env.example'), 'utf-8');
    // Gerçek API key içermemeli
    expect(envExample).not.toMatch(/sk-ant-api/);
    // Gerçek password içermemeli (placeholder hariç)
    expect(envExample).not.toMatch(/postgres:postgres/);
  });

  it('next.config.ts poweredByHeader false olmalı', () => {
    const config = readFileSync(resolve(__dirname, '../next.config.ts'), 'utf-8');
    expect(config).toContain('poweredByHeader: false');
  });

  it('next.config.ts security headers içermeli', () => {
    const config = readFileSync(resolve(__dirname, '../next.config.ts'), 'utf-8');
    expect(config).toContain('X-Frame-Options');
    expect(config).toContain('X-Content-Type-Options');
    expect(config).toContain('X-XSS-Protection');
    expect(config).toContain('Referrer-Policy');
  });

  it('middleware rate limiting içermeli', () => {
    const mw = readFileSync(resolve(__dirname, '../middleware.ts'), 'utf-8');
    expect(mw).toContain('RATE_LIMIT');
    expect(mw).toContain('checkRateLimit');
    expect(mw).toContain('429');
  });

  it('Login route hata detaylarını açığa vermemeli', () => {
    const login = readFileSync(resolve(__dirname, '../app/api/auth/login/route.ts'), 'utf-8');
    // error.message doğrudan kullanıcıya gönderilmemeli
    expect(login).not.toContain("'Sunucu hatasi: ' + errMsg");
  });

  it('Dockerfile non-root kullanıcı kullanmalı', () => {
    const dockerfile = readFileSync(resolve(__dirname, '../Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('USER nextjs');
    expect(dockerfile).toContain('adduser --system');
  });
});
