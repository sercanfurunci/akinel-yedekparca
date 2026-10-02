import posthog from 'posthog-js';
import { isPostHogConfigured } from '@/lib/analytics';

const log = (emit: () => void) => {
  if (typeof window === 'undefined' || !isPostHogConfigured) return;
  emit();
};

export const posthogLogs = {
  loginCompleted: (role: string) =>
    log(() => posthog.logger.info('authentication completed', {
      outcome: 'success',
      role,
    })),

  loginFailed: () =>
    log(() => posthog.logger.warn('authentication completed', {
      outcome: 'failure',
      failure_type: 'credentials_or_request',
    })),

  vinLookupCompleted: (hasCatalogMatch: boolean, possibleMatchCount: number) =>
    log(() => posthog.logger.info('vin lookup completed', {
      outcome: 'success',
      has_catalog_match: hasCatalogMatch,
      possible_match_count: possibleMatchCount,
    })),

  vinLookupFailed: (failureType: 'not_found' | 'request_failed') =>
    log(() => posthog.logger.warn('vin lookup completed', {
      outcome: 'failure',
      failure_type: failureType,
    })),

  cartItemAdded: (productId: string, quantity: number) =>
    log(() => posthog.logger.info('cart item update completed', {
      outcome: 'success',
      operation: 'add',
      product_id: productId,
      quantity,
    })),

  cartItemAddFailed: () =>
    log(() => posthog.logger.warn('cart item update completed', {
      outcome: 'failure',
      operation: 'add',
    })),
};
