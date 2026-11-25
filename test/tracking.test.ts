import { describe, expect, it, vi } from 'vitest';
import { blockActionProps, isLeadAction, sendBlockAction } from '../src';

describe('isLeadAction', () => {
  it('counts sign-up forms and sign-up actions as leads', () => {
    expect(
      isLeadAction({
        action: 'form_submit',
        block: 'newsletter-band',
        label: '',
      })
    ).toBe(true);
    expect(
      isLeadAction({ action: 'form_submit', block: 'contact-form', label: '' })
    ).toBe(true);
    expect(isLeadAction({ action: 'subscribe', block: null, label: '' })).toBe(
      true
    );
  });

  it('leaves other clicks and forms alone', () => {
    expect(
      isLeadAction({
        action: 'link_click',
        block: 'newsletter-band',
        label: '',
      })
    ).toBe(false);
    expect(
      isLeadAction({ action: 'form_submit', block: 'tip-jar', label: '' })
    ).toBe(false);
  });
});

describe('blockActionProps', () => {
  it('drops a link query and fragment, which can carry codes', () => {
    expect(
      blockActionProps({
        action: 'link_click',
        block: 'link-list',
        label: 'My shop',
        href: 'https://shop.example/a?token=secret#x',
      })
    ).toEqual({
      block: 'link-list',
      label: 'My shop',
      href: 'https://shop.example/a',
    });
  });

  it('names a non-web link by its scheme only', () => {
    expect(
      blockActionProps({
        action: 'link_click',
        block: null,
        label: 'Mail me',
        href: 'mailto:someone@example.com',
      })
    ).toEqual({ label: 'Mail me', href: 'mailto' });
  });
});

describe('sendBlockAction', () => {
  it('sends a goal for every action', () => {
    const trackGoal = vi.fn();
    const track = vi.fn();
    sendBlockAction(
      { action: 'buy', block: 'booking-card', label: 'Book' },
      { trackGoal, track }
    );
    expect(trackGoal).toHaveBeenCalledWith('block_buy', {
      block: 'booking-card',
      label: 'Book',
    });
    expect(track).not.toHaveBeenCalled();
  });

  it('sends a sign-up as a goal and a lead', () => {
    const trackGoal = vi.fn();
    const track = vi.fn();
    sendBlockAction(
      { action: 'form_submit', block: 'newsletter-band', label: 'Subscribe' },
      { trackGoal, track }
    );
    expect(trackGoal).toHaveBeenCalledWith('block_form_submit', {
      block: 'newsletter-band',
      label: 'Subscribe',
    });
    expect(track).toHaveBeenCalledWith('lead', {
      block: 'newsletter-band',
      label: 'Subscribe',
      method: 'newsletter-band',
    });
  });

  it('keeps goal names to what Buildbase accepts', () => {
    const trackGoal = vi.fn();
    sendBlockAction(
      { action: 'Save Contact!', block: null, label: '' },
      { trackGoal }
    );
    expect(trackGoal).toHaveBeenCalledWith('block_save_contact_', {});
  });

  it('never throws', () => {
    expect(() =>
      sendBlockAction(
        { action: 'buy', block: null, label: '' },
        {
          trackGoal: () => {
            throw new Error('blocked');
          },
        }
      )
    ).not.toThrow();
  });
});
