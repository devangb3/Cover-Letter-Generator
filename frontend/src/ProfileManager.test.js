import React, { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import App from './App';

global.IS_REACT_ACT_ENVIRONMENT = true;
const candidate = { profile: { name: 'Alex Example' }, experience: [], education: [], projects: [], skills: [] };
const settings = { hasApiKey: true, preferences: { defaultModel: 'model-a', instructions: '' } };
const models = { models: [{ slug: 'model-a', label: 'Model A' }], defaultModel: 'model-a' };
const response = data => ({ ok: true, json: async () => data });

describe('local profile onboarding', () => {
  let container, root;
  beforeEach(() => {
    container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); jest.restoreAllMocks(); });
  function mockState(profile, hasApiKey = true) {
    global.fetch = jest.fn(async url => response(url.endsWith('/profile') ? { profile } : url.endsWith('/settings') ? { ...settings, hasApiKey } : models));
  }
  async function clickText(text) {
    await act(async () => { Simulate.click([...container.querySelectorAll('button')].find(b => b.textContent === text || b.getAttribute('aria-label') === text)); });
  }
  it('opens connection setup on a clean installation', async () => {
    mockState(null, false);
    await act(async () => root.render(<App />));
    expect(container.textContent).toContain('Make it yours.');
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
    await clickText('Enter profile manually first');
    expect(container.textContent).toContain('Your experience. Ready for every role.');
    expect(container.querySelector('#contact-name').value).toBe('');
  });
  it.each(['', 'removed/model'])('preserves the effective default when saved model is %s', async savedModel => {
    const preferences = { defaultModel: savedModel, instructions: '' };
    const catalog = { models: [{ slug: 'model-a', label: 'Model A' }, { slug: 'model-b', label: 'Model B' }], defaultModel: 'model-b' };
    global.fetch = jest.fn(async url => response(url.endsWith('/profile') ? { profile: candidate } : url.endsWith('/settings') ? { hasApiKey: true, preferences } : catalog));
    await act(async () => root.render(<App />));
    await clickText('Settings');
    expect(container.querySelector('.profile-shell select').value).toBe('model-b');
    act(() => Simulate.change(container.querySelector('.profile-shell textarea'), { target: { value: 'Be concise.' } }));
    global.fetch.mockResolvedValueOnce(response({ hasApiKey: true, preferences: { defaultModel: 'model-b', instructions: 'Be concise.' } }));
    await act(async () => Simulate.submit(container.querySelector('.profile-shell form')));
    const write = global.fetch.mock.calls.find(([, options]) => options?.method === 'PUT');
    expect(JSON.parse(write[1].body).preferences).toEqual({ defaultModel: 'model-b', instructions: 'Be concise.' });
    await clickText('Back to application');
    await clickText('Settings');
    expect(container.querySelector('.profile-shell select').value).toBe('model-b');
  });
  it('loads a saved profile directly and cancels edits without losing job inputs', async () => {
    mockState(candidate);
    await act(async () => root.render(<App />));
    expect(container.querySelector('.header-account [aria-label="Edit profile"]').title).toContain('Alex Example');
    act(() => Simulate.change(container.querySelector('#companyName'), { target: { value: 'Example Company' } }));
    await clickText('Edit profile');
    act(() => Simulate.change(container.querySelector('#contact-name'), { target: { value: 'Unsaved name' } }));
    await clickText('Cancel');
    expect(container.querySelector('#companyName').value).toBe('Example Company');
    await clickText('Edit profile');
    expect(container.querySelector('#contact-name').value).toBe('Alex Example');
  });
  it('persists reviewed manual information only on Save', async () => {
    mockState(null);
    await act(async () => root.render(<App />));
    act(() => Simulate.change(container.querySelector('#contact-name'), { target: { value: 'Alex Example' } }));
    expect(global.fetch.mock.calls.every(([, options]) => !options?.method)).toBe(true);
    global.fetch.mockResolvedValueOnce(response({ profile: candidate }));
    await act(async () => Simulate.submit(container.querySelector('form')));
    const write = global.fetch.mock.calls.find(([, options]) => options?.method === 'PUT');
    expect(JSON.parse(write[1].body).profile.name).toBe('Alex Example');
    expect(container.querySelector('.header-account [aria-label="Edit profile"]').title).toContain('Alex Example');
  });

  it('reviews extraction without overwriting saved or manually entered sections', async () => {
    mockState({ ...candidate, projects: [{ id: 'manual-project', title: 'Manual evidence', bullets: ['Delivered a project.'] }] });
    await act(async () => root.render(<App />));
    await clickText('Edit profile');
    act(() => Simulate.change(container.querySelector('input[aria-label="Resume PDF"]'), { target: { files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })] } }));
    global.fetch.mockResolvedValueOnce(response({ profile: { ...candidate, profile: { name: 'Extracted name' } } }));
    await clickText('Extract with AI');
    expect(container.querySelector('#contact-name').value).toBe('Alex Example');
    await clickText('Use imported contact details');
    expect(container.querySelector('#contact-name').value).toBe('Extracted name');
    expect(container.querySelector('#projects-0-title').value).toBe('Manual evidence');
    expect(global.fetch.mock.calls.some(([, options]) => options?.method === 'PUT')).toBe(false);
    await clickText('Cancel');
    await clickText('Edit profile');
    expect(container.querySelector('#contact-name').value).toBe('Alex Example');
  });

  it('keeps manual entry available after extraction fails', async () => {
    mockState(null);
    await act(async () => root.render(<App />));
    act(() => Simulate.change(container.querySelector('input[aria-label="Resume PDF"]'), { target: { files: [new File(['pdf'], 'resume.pdf')] } }));
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'No readable text. Enter manually.' }) });
    await clickText('Extract with AI');
    expect(container.querySelector('[role="alert"]').textContent).toContain('Enter manually');
    expect(container.querySelector('#contact-name').disabled).toBe(false);
  });
});
