import React, { act } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import App from './App';

global.IS_REACT_ACT_ENVIRONMENT = true;

function setField(container, id, value) {
  const field = container.querySelector(`#${id}`);
  act(() => {
    Simulate.change(field, { target: { value, name: field.name } });
  });
}

describe('App AI workflows', () => {
  let container;
  let root;

  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        models: [
          { slug: 'model-a', label: 'Model A' },
          { slug: 'model-b', label: 'Model B' },
        ],
        defaultModel: 'model-a',
      }),
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<App />);
    });

    setField(container, 'name', 'Devang Borkar');
    setField(container, 'email', 'devang@example.com');
    setField(container, 'phone', '555-0100');
    setField(container, 'companyName', 'Example Corp');
    setField(container, 'jobDescription', 'Build reliable AI systems.');
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
  });

  test.each([
    ['Generate a tailored cover letter', null],
    ['Answer application questions', 'Why this company?'],
    ['Draft an email to the recruiting team', null],
    ['Generate a new one-page resume PDF', null],
  ])('stops %s without showing an error', async (actionTitle, questions) => {
    if (questions) setField(container, 'jobQuestions', questions);

    let requestSignal;
    global.fetch.mockImplementationOnce((_url, options) => {
      requestSignal = options.signal;
      return new Promise((_resolve, reject) => {
        requestSignal.addEventListener('abort', () => {
          reject(new DOMException('The request was aborted.', 'AbortError'));
        });
      });
    });

    act(() => {
      Simulate.click(container.querySelector(`[title="${actionTitle}"]`));
    });

    const stopButton = container.querySelector('.header-btn-stop');
    expect(stopButton).not.toBeNull();
    expect(stopButton.textContent.trim()).toBe('Stop');
    expect(requestSignal.aborted).toBe(false);
    expect(container.querySelector('.model-select-inline').disabled).toBe(true);

    await act(async () => {
      Simulate.click(stopButton);
    });

    expect(requestSignal.aborted).toBe(true);
    expect(container.querySelector('.header-btn-stop')).toBeNull();
    expect(container.querySelector('.model-select-inline').disabled).toBe(false);
    expect(container.querySelector('.error-message')).toBeNull();
  });

  it('keeps each generated application answer editable', async () => {
    setField(container, 'jobQuestions', 'Why this company?');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        answers: [{ question: 'Why this company?', answer: 'Original answer' }],
      }),
    });

    await act(async () => {
      Simulate.click(container.querySelector('[title="Answer application questions"]'));
    });

    const answerEditor = container.querySelector('#questionAnswerEditor-0');
    expect(answerEditor.value).toBe('Original answer');

    act(() => {
      Simulate.change(answerEditor, { target: { value: 'Edited answer' } });
    });

    expect(answerEditor.value).toBe('Edited answer');
  });

  it('omits the recruiting email heading while retaining the copy action', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ subject: 'Hello', body: 'Email body' }),
    });

    await act(async () => {
      Simulate.click(container.querySelector('[title="Draft an email to the recruiting team"]'));
    });

    expect(container.textContent).not.toContain('Ready to personalize and send');
    expect(container.textContent).not.toContain('Recruiting Outreach Email');
    expect(container.querySelector('[title="Copy subject and email body"]')).not.toBeNull();
  });
});
